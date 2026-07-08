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

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Classify a single inbound SMS body.
 * @param {string} message raw SMS text
 * @param {{ apiKey: string, model: string }} opts
 * @returns {Promise<{intent: string, confidence: number, reasoning: string}>}
 */
export async function classify(message, { apiKey, model }) {
  const body = {
    model,
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
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

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text}`);
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
