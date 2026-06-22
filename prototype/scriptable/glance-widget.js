// Personal Agent — Glance Surface (Visual MVP)
// ---------------------------------------------------------------------------
// Stage 0 prototype per docs/architecture.md (Decision 001).
// PURPOSE: validate the *visual* glanceable pattern on a real iPhone.
// This is VISUAL ONLY — all data below is hardcoded MOCK data. There is no
// server fetch and no real functionality by design.
//
// Runs in the free Scriptable app (no Apple Developer account, no Xcode).
// Supports Home Screen (small/medium/large) and Lock Screen accessory widgets.
// See README.md in this folder for how to install it on your phone.
// ---------------------------------------------------------------------------

// When previewing inside the Scriptable app (not as an installed widget),
// change this to "small" | "medium" | "large" | "accessoryRectangular" |
// "accessoryCircular" | "accessoryInline" to preview that size.
const PREVIEW_FAMILY = "large";

// --- MOCK DATA (placeholder only — no backend) -----------------------------
const MOCK = {
  greeting: "Good morning, Andrew",
  dateLabel: "Monday, June 22",
  dinner: { label: "Dinner", value: "Sheet-pan chicken" },
  finance: { label: "Spending", value: "$1,240 / $1,800" },
  markets: { label: "AAPL · VTI", value: "213.4 ▲  280.1 ▼" },
  news: { label: "Top story", value: "Transit plan passes" },
  project: { label: "Garage", value: "Order brackets" },
  budgetPct: 0.69, // for the circular lock-screen gauge
};

// --- Theme ------------------------------------------------------------------
const C = {
  bg0: "#1b1b2b",
  bg1: "#0d0d15",
  text: "#ffffff",
  sub: "#9a9aad",
  value: "#c7c7d6",
  dinner: "#ff8c66",
  finance: "#5fd0a0",
  markets: "#6db3ff",
  news: "#c89bff",
  project: "#ffd166",
};

const ROWS = [
  { sym: "fork.knife", color: C.dinner, item: MOCK.dinner },
  { sym: "dollarsign.circle", color: C.finance, item: MOCK.finance },
  { sym: "chart.line.uptrend.xyaxis", color: C.markets, item: MOCK.markets },
  { sym: "newspaper", color: C.news, item: MOCK.news },
  { sym: "hammer", color: C.project, item: MOCK.project },
];

// --- Helpers ----------------------------------------------------------------
function setGradientBackground(widget) {
  const g = new LinearGradient();
  g.colors = [new Color(C.bg0), new Color(C.bg1)];
  g.locations = [0, 1];
  widget.backgroundGradient = g;
}

function addHeader(widget) {
  const greet = widget.addText(MOCK.greeting);
  greet.font = Font.semiboldSystemFont(15);
  greet.textColor = new Color(C.text);
  greet.lineLimit = 1;
  const date = widget.addText(MOCK.dateLabel);
  date.font = Font.systemFont(11);
  date.textColor = new Color(C.sub);
  date.lineLimit = 1;
}

function addDomainRow(widget, { sym, color, item }, opts = {}) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  const symbol = SFSymbol.named(sym);
  symbol.applyFont(Font.systemFont(14));
  const icon = row.addImage(symbol.image);
  icon.imageSize = new Size(17, 17);
  icon.tintColor = new Color(color);
  icon.resizable = true;

  row.addSpacer(8);
  const label = row.addText(item.label);
  label.font = Font.semiboldSystemFont(13);
  label.textColor = new Color(C.text);
  label.lineLimit = 1;

  if (!opts.labelOnly) {
    row.addSpacer();
    const value = row.addText(item.value);
    value.font = Font.systemFont(13);
    value.textColor = new Color(C.value);
    value.lineLimit = 1;
  }
  return row;
}

function addFooter(widget) {
  const foot = widget.addText("Glance · mock data");
  foot.font = Font.systemFont(9);
  foot.textColor = new Color(C.sub);
  foot.lineLimit = 1;
}

// --- Home Screen layouts ----------------------------------------------------
function buildLarge() {
  const w = new ListWidget();
  setGradientBackground(w);
  w.setPadding(16, 16, 16, 16);
  addHeader(w);
  w.addSpacer(12);
  ROWS.forEach((r, i) => {
    addDomainRow(w, r);
    if (i < ROWS.length - 1) w.addSpacer(9);
  });
  w.addSpacer();
  addFooter(w);
  return w;
}

function buildMedium() {
  const w = new ListWidget();
  setGradientBackground(w);
  w.setPadding(14, 14, 14, 14);
  const date = w.addText(MOCK.dateLabel);
  date.font = Font.semiboldSystemFont(12);
  date.textColor = new Color(C.sub);
  w.addSpacer(8);
  ROWS.slice(0, 3).forEach((r, i) => {
    addDomainRow(w, r);
    if (i < 2) w.addSpacer(8);
  });
  return w;
}

function buildSmall() {
  const w = new ListWidget();
  setGradientBackground(w);
  w.setPadding(13, 13, 13, 13);

  const top = w.addStack();
  top.centerAlignContent();
  const sym = SFSymbol.named("fork.knife");
  sym.applyFont(Font.systemFont(13));
  const icon = top.addImage(sym.image);
  icon.imageSize = new Size(15, 15);
  icon.tintColor = new Color(C.dinner);
  top.addSpacer(6);
  const lbl = top.addText("Dinner");
  lbl.font = Font.semiboldSystemFont(12);
  lbl.textColor = new Color(C.sub);

  w.addSpacer(6);
  const title = w.addText(MOCK.dinner.value);
  title.font = Font.semiboldSystemFont(16);
  title.textColor = new Color(C.text);
  title.lineLimit = 2;

  w.addSpacer();
  const fin = w.addText(MOCK.finance.value);
  fin.font = Font.systemFont(12);
  fin.textColor = new Color(C.finance);
  fin.lineLimit = 1;
  return w;
}

// --- Lock Screen (accessory) layouts ---------------------------------------
function buildAccessoryRectangular() {
  const w = new ListWidget();
  const line1 = w.addText("🍴 " + MOCK.dinner.value);
  line1.font = Font.semiboldSystemFont(13);
  line1.lineLimit = 1;
  const line2 = w.addText("💵 " + MOCK.finance.value);
  line2.font = Font.systemFont(12);
  line2.lineLimit = 1;
  const line3 = w.addText("🔨 " + MOCK.project.value);
  line3.font = Font.systemFont(12);
  line3.lineLimit = 1;
  return w;
}

function buildAccessoryInline() {
  const w = new ListWidget();
  w.addText("🍴 " + MOCK.dinner.value + " · " + MOCK.finance.value);
  return w;
}

function buildAccessoryCircular() {
  const w = new ListWidget();
  w.setPadding(2, 2, 2, 2);
  const stack = w.addStack();
  stack.layoutVertically();
  stack.centerAlignContent();
  const pct = stack.addText(Math.round(MOCK.budgetPct * 100) + "%");
  pct.font = Font.boldSystemFont(15);
  pct.centerAlignText();
  const cap = stack.addText("budget");
  cap.font = Font.systemFont(8);
  cap.centerAlignText();
  return w;
}

// --- Dispatch ---------------------------------------------------------------
function buildWidget(family) {
  switch (family) {
    case "small":
      return buildSmall();
    case "medium":
      return buildMedium();
    case "large":
    case "extraLarge":
      return buildLarge();
    case "accessoryRectangular":
      return buildAccessoryRectangular();
    case "accessoryInline":
      return buildAccessoryInline();
    case "accessoryCircular":
      return buildAccessoryCircular();
    default:
      return buildLarge();
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
  const family = config.runsInWidget ? config.widgetFamily : PREVIEW_FAMILY;
  const widget = buildWidget(family);

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    await presentForPreview(widget, family);
  }
  Script.complete();
}

main();
