// classifier.mjs
// ---------------------------------------------------------------------------
// Standalone re-implementation of the Vesk SMS intent classifier for offline
// evaluation. This calls OpenAI directly so the eval runs with only an
// OPENAI_API_KEY — no Azure, no database, no running Vesk stack.
//
// FIDELITY NOTE
// The SYSTEM_PROMPT below is derived from the production prompt in:
//   src/Vesk.Infrastructure/Agents/ReplyHandlingAgent.cs  (SystemPrompt const)
// It keeps the parts that decide the classification — the intent definitions,
// the confidence-scoring guidelines, and the acknowledgment-vs-confirmation
// rules — and strips the parts that only orchestrate tools/DB in production
// (get_customer_history, get_appointment_details, appointment matching,
// confirm/cancel/reschedule tool calls). Those are actions taken AFTER the
// classification; here we score the classification itself.
//
// The CLASSIFY_INTENT_SCHEMA is copied verbatim from:
//   src/Vesk.Infrastructure/Agents/Tools/ClassifyIntentTool.cs  (InputSchema)
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `You are an SMS intent classifier for Vesk, a SaaS platform for appointment-based
businesses in Canada. Customers reply to reminder or booking SMS messages and you
must determine their intent. Customers reply in either French or English (both are
official languages in the Canadian market).

Classify the customer's message into exactly one of these intents:
- Confirm: customer is confirming their appointment (e.g. "Oui", "OK", "Je confirme", "Yes", "Confirmed", "I'll be there")
- Cancel: customer wants to cancel (e.g. "Annuler", "Cancel", "I can't make it", "Je ne peux pas venir")
- Reschedule: customer wants to change the time (e.g. "Reporter", "Changer l'heure", "Reschedule", "move it to Friday")
- Question: customer is asking a question (e.g. "C'est a quelle heure ?", "What time?", "How much?")
- Other: anything else

Confidence scoring guidelines (return a value between 0.0 and 1.0):
- 0.90-1.0: Very clear intent (e.g. a single-word affirmative/negative in the expected language)
- 0.75-0.89: Likely intent but some ambiguity
- 0.50-0.74: Uncertain — this is the range that should trigger staff review rather than an automatic action
- Below 0.50: Cannot determine intent

IMPORTANT — Distinguish acknowledgment from confirmation:
- Words like "Nice", "Cool", "Merci", "Thanks", "D'accord", a thumbs-up 👍 or a smiley after a
  BOOKING notification are acknowledgments (classify as Other), NOT confirmations.
- A confirmation is an explicit intent to confirm attendance: "Oui", "OK", "Confirm", "Je confirme",
  "I'll be there".
- When in doubt, classify as Other with LOW confidence rather than accidentally confirming.

You must always call the classify_intent function with your intent, confidence, and a brief reasoning.`;

// The acknowledgment-vs-confirmation block is the guardrail against confident
// false-confirms (👍 / "D'accord" read as Confirm). The ablation prompt below
// removes exactly this block so the eval can demonstrate the rule's effect.
export const ACK_RULE = `IMPORTANT — Distinguish acknowledgment from confirmation:
- Words like "Nice", "Cool", "Merci", "Thanks", "D'accord", a thumbs-up 👍 or a smiley after a
  BOOKING notification are acknowledgments (classify as Other), NOT confirmations.
- A confirmation is an explicit intent to confirm attendance: "Oui", "OK", "Confirm", "Je confirme",
  "I'll be there".
- When in doubt, classify as Other with LOW confidence rather than accidentally confirming.

`;

// Ablation prompt: identical, minus the acknowledgment rule. Used only by the
// eval's --no-ack-rule mode; production and n8n always use the full SYSTEM_PROMPT.
export const SYSTEM_PROMPT_NO_ACK = SYSTEM_PROMPT.replace(ACK_RULE, "");

// Copied verbatim from ClassifyIntentTool.InputSchema (Vesk.Infrastructure).
export const CLASSIFY_INTENT_SCHEMA = {
  type: "object",
  properties: {
    intent: {
      type: "string",
      enum: ["Confirm", "Cancel", "Reschedule", "Question", "Other"],
      description: "The classified intent of the customer's message",
    },
    confidence: {
      type: "number",
      minimum: 0.0,
      maximum: 1.0,
      description: "Confidence score between 0.0 and 1.0",
    },
    reasoning: {
      type: "string",
      description: "Brief explanation of why this intent was chosen",
    },
  },
  required: ["intent", "confidence", "reasoning"],
};

/**
 * Resolve which LLM provider to call from env vars. Azure takes precedence if
 * configured (matches Vesk's production AzureOpenAIClient); otherwise plain OpenAI.
 * Returns null if neither is configured.
 * @param {Record<string,string|undefined>} env
 */
export function resolveProvider(env = process.env) {
  // --- Azure OpenAI / Azure AI Foundry ---
  if (env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY) {
    const endpoint = env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, "");
    const deployment = env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
    const apiVersion = env.AZURE_OPENAI_API_VERSION || "2024-10-21";
    return {
      provider: "azure",
      url: `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      headers: { "Content-Type": "application/json", "api-key": env.AZURE_OPENAI_API_KEY },
      model: deployment,     // Azure ignores the body `model`; deployment is in the URL
      sendModel: false,
      label: `azure:${deployment}`,
    };
  }
  // --- OpenAI ---
  if (env.OPENAI_API_KEY) {
    const model = env.OPENAI_MODEL || "gpt-4o-mini";
    return {
      provider: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      model,
      sendModel: true,
      label: model,
    };
  }
  return null;
}

/**
 * Classify a single inbound SMS body.
 * @param {string} message raw SMS text
 * @param {ReturnType<typeof resolveProvider>} cfg provider config from resolveProvider()
 * @returns {Promise<{intent: string, confidence: number, reasoning: string}>}
 */
export async function classify(message, cfg, systemPrompt = SYSTEM_PROMPT) {
  const body = {
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Customer sent this SMS: "${message}"` },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "classify_intent",
          description:
            "Records the intent classification result for an inbound SMS.",
          parameters: CLASSIFY_INTENT_SCHEMA,
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: "classify_intent" },
    },
  };
  if (cfg.sendModel) body.model = cfg.model;

  const res = await fetch(cfg.url, {
    method: "POST",
    headers: cfg.headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${cfg.provider} ${res.status}: ${text}`);
  }

  const data = await res.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    throw new Error(`No tool call in response: ${JSON.stringify(data)}`);
  }

  const args = JSON.parse(toolCall.function.arguments);
  return {
    intent: args.intent,
    confidence: Number(args.confidence),
    reasoning: args.reasoning ?? "",
  };
}
