// One-off asset-capture script — NOT a QA regression run.
// Registers a single polished demo tenant ("Studio Lumière"), seeds a few realistic
// customers + appointments through the real UI, then captures two screenshots for the
// README: the dashboard hero shot (desktop) and the public booking time-slot step (mobile).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { WEB_BASE } from "../lib/driver.mjs";

const OUT_DIR = join(process.cwd(), "..", "docs", "screenshots");
mkdirSync(OUT_DIR, { recursive: true });

const DEMO = {
  firstName: "Camille",
  lastName: "Rousseau",
  businessName: "Studio Lumière",
  email: "demo@studiolumiere.example",
  password: "StudioLumiere2026!",
};

function log(...args) {
  console.log(...args);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ---- Desktop context: register + seed data + dashboard screenshot ----
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktopCtx.newPage();

  log("Registering tenant...");
  await page.goto(`${WEB_BASE}/register`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("Jane").fill(DEMO.firstName);
  await page.getByPlaceholder("Doe").fill(DEMO.lastName);
  await page.getByPlaceholder("Salon Belleza").fill(DEMO.businessName);
  await page.getByPlaceholder("you@business.com").fill(DEMO.email);
  await page.getByPlaceholder("••••••••").fill(DEMO.password);
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(/\/app\b/, { timeout: 15000 });
  log("Landed on dashboard after registration.");

  // ---- Settings: business info, services, business hours ----
  await page.goto(`${WEB_BASE}/app/settings`, { waitUntil: "networkidle" });

  // Business tab (default active) — fill address + phone for realism, save.
  await page.getByPlaceholder("+14165551234").fill("+15145551234");
  await page.getByPlaceholder("123 Rue Saint-Denis, Montréal, QC").fill("482 Rue Saint-Denis, Montréal, QC");
  await page.getByPlaceholder("contact@salonbelleza.com").fill("bonjour@studiolumiere.example");
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForTimeout(600);

  // Services tab — add two realistic services.
  await page.getByRole("button", { name: "Services" }).click();
  await page.waitForTimeout(300);

  async function addService(name, duration, price) {
    await page.getByPlaceholder("Service name").fill(name);
    const durationInput = page.locator('input[type="number"]').first();
    await durationInput.fill(String(duration));
    await page.getByPlaceholder("Price").fill(String(price));
    await page.getByRole("button", { name: "Add" }).click();
    await page.waitForTimeout(500);
  }
  await addService("Haircut & Style", 45, 65);
  await addService("Colour Treatment", 90, 120);
  log("Services added.");

  // Business Hours tab — persist the default hours so public booking has open slots.
  await page.getByRole("button", { name: "Business Hours" }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForTimeout(600);
  log("Business hours saved.");

  // ---- Customers: add 3 realistic customers ----
  await page.goto(`${WEB_BASE}/app/customers`, { waitUntil: "networkidle" });

  const customers = [
    { firstName: "Sophie", lastName: "Tremblay", phone: "+15145559821", email: "sophie.tremblay@gmail.com" },
    { firstName: "Marc-Antoine", lastName: "Bouchard", phone: "+15145557734", email: "ma.bouchard@outlook.com" },
    { firstName: "Léa", lastName: "Fontaine", phone: "+15145556612", email: "lea.fontaine@gmail.com" },
  ];

  for (const c of customers) {
    await page.getByRole("button", { name: /add customer/i }).click();
    await page.waitForTimeout(300);
    await page.getByPlaceholder("Sarah", { exact: true }).fill(c.firstName);
    await page.getByPlaceholder("Benali").fill(c.lastName);
    await page.getByPlaceholder("+14165551234").fill(c.phone);
    await page.getByPlaceholder("sarah@example.com").fill(c.email);
    // Scope to the modal <form> — the page also has a top-toolbar button with the same name.
    await page.locator("form").getByRole("button", { name: /add customer/i }).click();
    await page.waitForTimeout(600);
  }
  log("Customers added.");

  // ---- Appointments: 3 appointments across the next few days ----
  await page.goto(`${WEB_BASE}/app/appointments`, { waitUntil: "networkidle" });

  function isoLocal(daysFromNow, hour) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
  }

  // All strictly in the future relative to "now" — a past `startsAt` gets auto-flipped to
  // Missed/Completed by the AppointmentLifecycleWorker before we can screenshot it.
  const appts = [
    { customer: "Sophie Tremblay", service: "Haircut & Style", when: isoLocal(1, 10) }, // tomorrow, 10am
    { customer: "Marc-Antoine Bouchard", service: "Colour Treatment", when: isoLocal(2, 14) }, // day after, 2pm
    { customer: "Léa Fontaine", service: "Haircut & Style", when: isoLocal(3, 11) }, // 3 days out, 11am
  ];

  for (const a of appts) {
    await page.getByRole("button", { name: /new appointment/i }).click();
    await page.waitForTimeout(300);
    await page.locator("select").first().selectOption({ label: a.customer });
    await page.locator('input[placeholder*="Select or type"], input[placeholder*="e.g. Haircut"]').first().fill(a.service);
    await page.locator('input[type="datetime-local"]').fill(a.when);
    await page.getByRole("button", { name: /^create$/i }).click();
    await page.waitForTimeout(700);
  }
  log("Appointments created.");

  // Confirm the first appointment (today's Sophie Tremblay) so we get status variety.
  await page.goto(`${WEB_BASE}/app/appointments`, { waitUntil: "networkidle" });
  await page.getByText("Sophie Tremblay").first().click();
  await page.waitForTimeout(400);
  const confirmBtn = page.getByRole("button", { name: /^confirm$/i });
  if (await confirmBtn.count()) {
    await confirmBtn.click();
    await page.waitForTimeout(500);
  }
  await page.keyboard.press("Escape");
  log("One appointment confirmed for status variety.");

  // ---- Dashboard hero screenshot ----
  await page.goto(`${WEB_BASE}/app`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800); // let KPI queries settle
  const dashboardShot = join(OUT_DIR, "dashboard-hero.png");
  await page.screenshot({ path: dashboardShot, fullPage: false });
  log(`Saved: ${dashboardShot}`);

  await desktopCtx.close();

  // ---- Find the tenant slug for the public booking page (queried from Postgres directly) ----
  const { execSync } = await import("node:child_process");
  const slugRaw = execSync(
    `docker exec vesk_db psql -U vesk -d vesk_dev -t -A -c "select slug from tenants where business_name = 'Studio Lumière' order by created_at desc limit 1;"`,
    { encoding: "utf8" }
  ).trim();
  const slug = slugRaw || null;
  log(`Detected slug from Postgres: ${slug}`);

  if (!slug) {
    throw new Error("Could not determine tenant slug from Postgres.");
  }

  // ---- Mobile context: public booking flow, time-slot picking step ----
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const mpage = await mobileCtx.newPage();
  await mpage.goto(`${WEB_BASE}/book/${slug}`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(500);

  // Step 1: choose a service
  await mpage.getByText("Haircut & Style", { exact: true }).click();
  await mpage.waitForTimeout(400);

  // Step 2: pick a date a couple days out (well within business hours + advance window)
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  await mpage.locator("#booking-date").fill(dateStr);
  await mpage.waitForTimeout(900); // let slots load

  const bookingShot = join(OUT_DIR, "booking-mobile.png");
  await mpage.screenshot({ path: bookingShot, fullPage: false });
  log(`Saved: ${bookingShot}`);

  await mobileCtx.close();
  await browser.close();

  log("\n=== DONE ===");
  log(`Tenant: ${DEMO.businessName} (${DEMO.email})`);
  log(`Slug: ${slug}`);
  log(`Screenshots: ${dashboardShot} , ${bookingShot}`);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
