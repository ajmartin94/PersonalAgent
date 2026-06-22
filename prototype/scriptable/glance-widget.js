// Personal Agent — Glance Surface (Home + Lock Screen widget)
// ---------------------------------------------------------------------------
// Stage 0 / functional MVP per docs/architecture.md (Decisions 001 & 002).
// Fetches live cards from the backend's GET /api/glance and renders them on the
// Home Screen (small/medium/large) and Lock Screen (accessory) sizes.
// If the server is unreachable, it falls back to mock data so the surface
// always renders. Runs in the free Scriptable app — no Apple Developer account.
//
// SET THIS to your running server. For two phones, use the Mac/server's LAN IP
// (e.g. http://192.168.1.20:3000), not localhost. See README.md.
// ---------------------------------------------------------------------------

const BASE_URL = "http://localhost:3000";

// Preview size when running inside the Scriptable app (not as an installed widget):
// "small" | "medium" | "large" | "accessoryRectangular" | "accessoryCircular" | "accessoryInline"
const PREVIEW_FAMILY = "large";

// --- Theme ------------------------------------------------------------------
const C = {
  bg0: "#1b1b2b", bg1: "#0d0d15", text: "#ffffff", sub: "#9a9aad", value: "#c7c7d6",
  kitchen: "#ff8c66", finance: "#5fd0a0", markets: "#6db3ff", news: "#c89bff", projects: "#ffd166",
};

function colorFor(card) {
  if (card.label === "Markets") return C.markets;
  return C[card.domain] || C.text;
}

// Cards use the same shape the server returns from GET /api/glance.
const MOCK_CARDS = [
  { domain: "kitchen", symbol: "fork.knife", label: "Dinner", value: "Sheet-pan chicken", sub: "Day: Mon" },
  { domain: "finance", symbol: "dollarsign.circle", label: "Spending", value: "$508 / $1,400", sub: "On track" },
  { domain: "finance", symbol: "chart.line.uptrend.xyaxis", label: "Markets", value: "AAPL 213.4 ▲ VTI 280.1 ▼", sub: "" },
  { domain: "news", symbol: "newspaper", label: "Top story", value: "Transit plan passes", sub: "Local" },
  { domain: "projects", symbol: "hammer", label: "Garage", value: "Order brackets", sub: "Next up" },
];

async function fetchCards() {
  try {
    const req = new Request(`${BASE_URL}/api/glance`);
    req.timeoutInterval = 5;
    const json = await req.loadJSON();
    if (json && Array.isArray(json.cards) && json.cards.length) return json.cards;
  } catch (_e) {
    // offline / server down → fall through to mock
  }
  return null;
}

function cardByLabel(cards, label) {
  return cards.find((c) => c.label === label) || null;
}

// --- Helpers ----------------------------------------------------------------
function setGradientBackground(widget) {
  const g = new LinearGradient();
  g.colors = [new Color(C.bg0), new Color(C.bg1)];
  g.locations = [0, 1];
  widget.backgroundGradient = g;
}

function addHeader(widget, live) {
  const greet = widget.addText("Good morning, Andrew");
  greet.font = Font.semiboldSystemFont(15);
  greet.textColor = new Color(C.text);
  greet.lineLimit = 1;
  const date = widget.addText(live ? "Live · today" : "Offline · sample");
  date.font = Font.systemFont(11);
  date.textColor = new Color(C.sub);
  date.lineLimit = 1;
}

function addCardRow(widget, card) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  const symbol = SFSymbol.named(card.symbol || "circle");
  symbol.applyFont(Font.systemFont(14));
  const icon = row.addImage(symbol.image);
  icon.imageSize = new Size(17, 17);
  icon.tintColor = new Color(colorFor(card));

  row.addSpacer(8);
  const label = row.addText(card.label);
  label.font = Font.semiboldSystemFont(13);
  label.textColor = new Color(C.text);
  label.lineLimit = 1;

  row.addSpacer();
  const value = row.addText(card.value);
  value.font = Font.systemFont(13);
  value.textColor = new Color(C.value);
  value.lineLimit = 1;
}

// --- Home Screen layouts ----------------------------------------------------
function buildLarge(cards, live) {
  const w = new ListWidget();
  setGradientBackground(w);
  w.setPadding(16, 16, 16, 16);
  addHeader(w, live);
  w.addSpacer(12);
  cards.forEach((card, i) => {
    addCardRow(w, card);
    if (i < cards.length - 1) w.addSpacer(9);
  });
  w.addSpacer();
  const foot = w.addText(live ? "Glance · live data" : "Glance · mock data");
  foot.font = Font.systemFont(9);
  foot.textColor = new Color(C.sub);
  return w;
}

function buildMedium(cards, live) {
  const w = new ListWidget();
  setGradientBackground(w);
  w.setPadding(14, 14, 14, 14);
  const date = w.addText(live ? "Today · live" : "Today · sample");
  date.font = Font.semiboldSystemFont(12);
  date.textColor = new Color(C.sub);
  w.addSpacer(8);
  cards.slice(0, 3).forEach((card, i) => {
    addCardRow(w, card);
    if (i < 2) w.addSpacer(8);
  });
  return w;
}

function buildSmall(cards) {
  const w = new ListWidget();
  setGradientBackground(w);
  w.setPadding(13, 13, 13, 13);
  const dinner = cardByLabel(cards, "Dinner") || cards[0];
  const spending = cardByLabel(cards, "Spending");

  const top = w.addStack();
  top.centerAlignContent();
  const sym = SFSymbol.named(dinner.symbol || "fork.knife");
  sym.applyFont(Font.systemFont(13));
  const icon = top.addImage(sym.image);
  icon.imageSize = new Size(15, 15);
  icon.tintColor = new Color(C.kitchen);
  top.addSpacer(6);
  const lbl = top.addText(dinner.label);
  lbl.font = Font.semiboldSystemFont(12);
  lbl.textColor = new Color(C.sub);

  w.addSpacer(6);
  const title = w.addText(dinner.value);
  title.font = Font.semiboldSystemFont(16);
  title.textColor = new Color(C.text);
  title.lineLimit = 2;

  w.addSpacer();
  if (spending) {
    const fin = w.addText(spending.value);
    fin.font = Font.systemFont(12);
    fin.textColor = new Color(C.finance);
    fin.lineLimit = 1;
  }
  return w;
}

// --- Lock Screen (accessory) layouts ---------------------------------------
function buildAccessoryRectangular(cards) {
  const w = new ListWidget();
  const dinner = cardByLabel(cards, "Dinner");
  const spending = cardByLabel(cards, "Spending");
  const project = cards.find((c) => c.domain === "projects");
  if (dinner) w.addText(`🍴 ${dinner.value}`).font = Font.semiboldSystemFont(13);
  if (spending) w.addText(`💵 ${spending.value}`).font = Font.systemFont(12);
  if (project) w.addText(`🔨 ${project.value}`).font = Font.systemFont(12);
  return w;
}

function buildAccessoryInline(cards) {
  const w = new ListWidget();
  const dinner = cardByLabel(cards, "Dinner");
  const spending = cardByLabel(cards, "Spending");
  w.addText(`🍴 ${dinner ? dinner.value : "—"} · ${spending ? spending.value : ""}`);
  return w;
}

function buildAccessoryCircular(cards) {
  const w = new ListWidget();
  w.setPadding(2, 2, 2, 2);
  const spending = cardByLabel(cards, "Spending");
  const m = spending ? spending.value.match(/\$([\d.,]+)\s*\/\s*\$([\d.,]+)/) : null;
  const label = m ? `${Math.round((parseFloat(m[1].replace(/,/g, "")) / parseFloat(m[2].replace(/,/g, ""))) * 100)}%` : "•";
  const stack = w.addStack();
  stack.layoutVertically();
  stack.centerAlignContent();
  const pct = stack.addText(label);
  pct.font = Font.boldSystemFont(15);
  pct.centerAlignText();
  const cap = stack.addText("budget");
  cap.font = Font.systemFont(8);
  cap.centerAlignText();
  return w;
}

// --- Dispatch ---------------------------------------------------------------
function buildWidget(family, cards, live) {
  switch (family) {
    case "small": return buildSmall(cards);
    case "medium": return buildMedium(cards, live);
    case "large":
    case "extraLarge": return buildLarge(cards, live);
    case "accessoryRectangular": return buildAccessoryRectangular(cards);
    case "accessoryInline": return buildAccessoryInline(cards);
    case "accessoryCircular": return buildAccessoryCircular(cards);
    default: return buildLarge(cards, live);
  }
}

async function presentForPreview(widget, family) {
  switch (family) {
    case "small":
    case "accessoryRectangular":
    case "accessoryCircular":
    case "accessoryInline":
      return widget.presentSmall();
    case "medium":
      return widget.presentMedium();
    default:
      return widget.presentLarge();
  }
}

async function main() {
  const fetched = await fetchCards();
  const live = !!fetched;
  const cards = fetched || MOCK_CARDS;
  const family = config.runsInWidget ? config.widgetFamily : PREVIEW_FAMILY;
  const widget = buildWidget(family, cards, live);

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    await presentForPreview(widget, family);
  }
  Script.complete();
}

main();
