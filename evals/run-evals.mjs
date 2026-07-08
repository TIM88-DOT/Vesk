// run-evals.mjs
// ---------------------------------------------------------------------------
// Offline eval harness for the Vesk SMS intent classifier.
//
//   node run-evals.mjs         # run all cases, print summary, write results.md
//
// Needs OPENAI_API_KEY (from .env or the environment). If it is missing, the
// script prints setup instructions and exits 0 so a reviewer's clone never
// crashes.
//
// Scoring separates the two kinds of failure that actually matter in prod:
//   - DANGEROUS  : wrong intent AND confidence >= 0.85 on an actionable intent
//                  -> the C# thresholds would auto-act (auto-confirm/cancel/etc.)
//   - SAFE-FAIL  : wrong intent AND confidence < 0.75
//                  -> the escalation gate catches it; a human reviews it
// The whole point of the confidence threshold in ReplyHandlingAgent is to
// convert would-be dangerous failures into safe ones. This harness measures
// how well it does that.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { classify, resolveProvider } from "./classifier.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Thresholds mirror the production logic:
//   src/Vesk.Infrastructure/Agents/ReplyHandlingAgent.cs (system prompt + action rules)
const AUTO_ACT_THRESHOLD = 0.85; // >= this on an actionable intent -> auto-act
const ESCALATE_THRESHOLD = 0.75; // < this -> escalate to staff
const ACTIONABLE = new Set(["Confirm", "Cancel", "Reschedule"]);

const CONCURRENCY = 4;

// --- tiny .env loader (no dependency) --------------------------------------
function loadEnv() {
  const envPath = join(__dirname, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

function loadCases() {
  const raw = readFileSync(join(__dirname, "cases.jsonl"), "utf8");
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

// What would the production system actually DO with this classification?
export function simulateAction(intent, confidence) {
  if (ACTIONABLE.has(intent) && confidence >= AUTO_ACT_THRESHOLD) {
    return `Auto-${intent.toLowerCase()}`;
  }
  if (confidence < ESCALATE_THRESHOLD) return "Escalate";
  return "Log/Review";
}

export function verdictFor(c, predicted, confidence) {
  const acceptable = new Set([c.expected, ...(c.acceptable ?? [])]);
  if (acceptable.has(predicted)) return "PASS";
  // Wrong. How bad?
  if (ACTIONABLE.has(predicted) && confidence >= AUTO_ACT_THRESHOLD) {
    return "DANGEROUS"; // system would auto-act on a wrong classification
  }
  if (confidence < ESCALATE_THRESHOLD) return "SAFE-FAIL"; // escalation gate catches it
  return "FAIL"; // wrong but only logged (no auto-action)
}

// --- concurrency pool ------------------------------------------------------
async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

async function main() {
  loadEnv();
  const provider = resolveProvider(process.env);

  if (!provider) {
    console.log(`
No LLM provider configured. Set ONE of these in .env (cp .env.example .env):

  OpenAI:            OPENAI_API_KEY=sk-...
  Azure AI Foundry:  AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com
                     AZURE_OPENAI_API_KEY=<key>
                     AZURE_OPENAI_DEPLOYMENT=<your-deployment-name>

Then: node run-evals.mjs   (See results.md for a committed sample run.)
`);
    process.exit(0);
  }

  const cases = loadCases();
  console.log(`Running ${cases.length} cases against ${provider.label}...\n`);

  const rows = await mapPool(cases, CONCURRENCY, async (c) => {
    try {
      const { intent, confidence, reasoning } = await classify(c.message, provider);
      const action = simulateAction(intent, confidence);
      const verdict = verdictFor(c, intent, confidence);
      return { c, intent, confidence, reasoning, action, verdict };
    } catch (err) {
      return {
        c,
        intent: "ERROR",
        confidence: 0,
        reasoning: String(err.message ?? err),
        action: "-",
        verdict: "ERROR",
      };
    }
  });

  // --- metrics ---
  const { total, passes, dangerous, safeFails, loggedFails, errors, acc } =
    computeMetrics(rows);

  // --- console table ---
  console.log(
    pad("ID", 4) + pad("Message", 30) + pad("Exp", 12) + pad("Got", 12) +
    pad("Conf", 7) + pad("Action", 14) + "Verdict"
  );
  console.log("-".repeat(95));
  for (const r of rows) {
    console.log(
      pad(r.c.id, 4) +
        pad(r.c.message.slice(0, 28), 30) +
        pad(r.c.expected, 12) +
        pad(r.intent, 12) +
        pad(r.confidence.toFixed(2), 7) +
        pad(r.action, 14) +
        r.verdict
    );
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Accuracy:        ${passes}/${total}  (${acc}%)`);
  console.log(`DANGEROUS fails: ${dangerous}   (wrong + would auto-act)`);
  console.log(`SAFE fails:      ${safeFails}   (wrong but escalated by <0.75 gate)`);
  console.log(`Logged fails:    ${loggedFails}   (wrong, no auto-action)`);
  if (errors) console.log(`Errors:          ${errors}`);
  console.log("=".repeat(50));

  writeResults(rows, { total, passes, dangerous, safeFails, loggedFails, errors, acc, model: provider.label });
  console.log("\nWrote results.md");
}

export function computeMetrics(rows) {
  const total = rows.length;
  const passes = rows.filter((r) => r.verdict === "PASS").length;
  const dangerous = rows.filter((r) => r.verdict === "DANGEROUS").length;
  const safeFails = rows.filter((r) => r.verdict === "SAFE-FAIL").length;
  const loggedFails = rows.filter((r) => r.verdict === "FAIL").length;
  const errors = rows.filter((r) => r.verdict === "ERROR").length;
  const acc = ((passes / total) * 100).toFixed(1);
  return { total, passes, dangerous, safeFails, loggedFails, errors, acc };
}

export function writeResults(rows, m) {
  const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
  const line = (r) =>
    `| ${r.c.id} | \`${esc(r.c.message)}\` | ${r.c.lang} | ${r.c.expected} | ${r.intent} | ${r.confidence.toFixed(2)} | ${r.action} | ${r.verdict} |`;

  const failures = rows.filter((r) => r.verdict !== "PASS");

  const out = `# Eval results

_Generated by \`run-evals.mjs\` against \`${m.model}\`. Regenerate with \`npm run eval\`._

## Summary

| Metric | Value |
|---|---|
| Cases | ${m.total} |
| Accuracy | **${m.passes}/${m.total} (${m.acc}%)** |
| DANGEROUS fails (wrong + would auto-act, conf ≥ 0.85) | **${m.dangerous}** |
| SAFE fails (wrong but escalated, conf < 0.75) | ${m.safeFails} |
| Logged fails (wrong, no auto-action) | ${m.loggedFails} |
${m.errors ? `| Errors | ${m.errors} |\n` : ""}
**Verdict legend** — \`Action\` is what the production C# would do at the 0.85 / 0.75 thresholds:
\`Auto-*\` = irreversible-ish automatic action, \`Escalate\` = handed to staff, \`Log/Review\` = recorded only.
A **DANGEROUS** row is the only kind that hurts a customer: the model was both wrong *and* confident
enough that the system would have acted. The escalation gate exists to keep this number at zero.

## Failures only

${failures.length === 0 ? "_No failures in this run._" : `| ID | Message | Lang | Expected | Got | Conf | Action | Verdict |
|---|---|---|---|---|---|---|---|
${failures.map(line).join("\n")}`}

## All cases

| ID | Message | Lang | Expected | Got | Conf | Action | Verdict |
|---|---|---|---|---|---|---|---|
${rows.map(line).join("\n")}
`;

  writeFileSync(join(__dirname, "results.md"), out);
}

// Only run when invoked directly (node run-evals.mjs), not when imported.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
