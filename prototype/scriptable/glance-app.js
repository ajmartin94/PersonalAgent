// Personal Agent — Main App Screen (functional dashboard + chat preview)
// ---------------------------------------------------------------------------
// Full-screen view you tap into from the glance widget. The dashboard cards are
// fetched LIVE from the backend's GET /api/glance (native Request — no CORS),
// falling back to mock data when the server is down. The chat panel here is a
// visual sample; for a working conversation run the "Glance Chat" script
// (glance-chat.js), which posts to /api/chat. See README.md.
// ---------------------------------------------------------------------------

const BASE_URL = "http://localhost:3000";

const MOCK_CARDS = [
  { domain: "kitchen", label: "Dinner", value: "Sheet-pan chicken & veg", sub: "Prep 6:30 PM · serves 4" },
  { domain: "finance", label: "Spending", value: "$508 / $1,400 this month", sub: "On track" },
  { domain: "finance", label: "Markets", value: "AAPL 213.4 ▲ · VTI 280.1 ▼", sub: "Watchlist" },
  { domain: "news", label: "Top story", value: "Transit plan clears final vote", sub: "Local" },
  { domain: "projects", label: "Garage", value: "Order shelving brackets", sub: "Next up" },
];

const EMOJI = { kitchen: "&#127860;", finance: "&#128181;", news: "&#128240;", projects: "&#128296;" };
const COLOR = { kitchen: "#ff8c66", finance: "#5fd0a0", news: "#c89bff", projects: "#ffd166" };

function emojiFor(card) {
  if (card.label === "Markets") return "&#128200;";
  return EMOJI[card.domain] || "&#9679;";
}
function colorFor(card) {
  if (card.label === "Markets") return "#6db3ff";
  return COLOR[card.domain] || "#ffffff";
}
function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function fetchCards() {
  try {
    const req = new Request(`${BASE_URL}/api/glance`);
    req.timeoutInterval = 5;
    const json = await req.loadJSON();
    if (json && Array.isArray(json.cards) && json.cards.length) return json.cards;
  } catch (_e) {
    // offline → mock
  }
  return null;
}

function cardsHtml(cards) {
  return cards
    .map(
      (c) =>
        `<div class="card"><div class="badge" style="color:${colorFor(c)}">${emojiFor(c)}</div>` +
        `<div class="body"><div class="title">${esc(c.value)}</div>` +
        `<div class="value">${esc(c.label)}</div>` +
        `<div class="sub">${esc(c.sub || "")}</div></div></div>`,
    )
    .join("");
}

function pageHtml(cards, live) {
  const TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>
  :root { --bg0:#1b1b2b; --bg1:#0d0d15; --card:#1f1f30; --card2:#262639;
    --text:#fff; --sub:#9a9aad; --value:#c7c7d6; --accent:#6db3ff; }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  html,body { margin:0; height:100%; }
  body { font-family:-apple-system,BlinkMacSystemFont,sans-serif;
    background:linear-gradient(180deg,var(--bg0),var(--bg1)); color:var(--text);
    padding:max(14px,env(safe-area-inset-top)) 14px max(14px,env(safe-area-inset-bottom));
    -webkit-user-select:none; user-select:none; }
  .header { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
  .avatar { width:38px; height:38px; border-radius:50%;
    background:linear-gradient(135deg,#6db3ff,#c89bff); flex:0 0 auto; }
  .greet { font-size:17px; font-weight:600; }
  .date { font-size:12px; color:var(--sub); margin-top:2px; }
  .status { font-size:11px; color:var(--sub); margin:0 0 12px 50px; }
  .seg { display:flex; background:var(--card); border-radius:11px; padding:3px; margin-bottom:14px; }
  .seg button { flex:1; border:0; background:transparent; color:var(--sub);
    font-size:13px; font-weight:600; padding:7px 0; border-radius:8px; font-family:inherit; }
  .seg button.active { background:var(--card2); color:var(--text); }
  .view { display:none; } .view.active { display:block; }
  .card { display:flex; align-items:flex-start; gap:12px; background:var(--card);
    border-radius:14px; padding:13px 14px; margin-bottom:10px; }
  .badge { width:34px; height:34px; border-radius:10px; flex:0 0 auto; display:flex;
    align-items:center; justify-content:center; font-size:17px; background:rgba(255,255,255,0.06); }
  .card .body { flex:1; min-width:0; }
  .card .title { font-size:15px; font-weight:600; }
  .card .value { font-size:13px; color:var(--sub); margin-top:2px; }
  .card .sub { font-size:12px; color:var(--sub); margin-top:3px; }
  .bubble { max-width:80%; padding:9px 12px; border-radius:16px; font-size:14px;
    line-height:1.35; margin-bottom:9px; }
  .agent { background:var(--card2); border-bottom-left-radius:5px; }
  .user { background:var(--accent); color:#06121f; margin-left:auto; border-bottom-right-radius:5px; }
  .note { font-size:12px; color:var(--sub); margin-top:10px; }
  .foot { text-align:center; font-size:10px; color:var(--sub); margin-top:12px; }
</style>
</head>
<body>
  <div class="header">
    <div class="avatar"></div>
    <div><div class="greet">Good morning, Andrew</div><div class="date">Monday, June 22</div></div>
  </div>
  <div class="status">__STATUS__</div>
  <div class="seg">
    <button id="tabGlance" class="active" onclick="show('glance')">Glance</button>
    <button id="tabChat" onclick="show('chat')">Chat</button>
  </div>
  <div id="glance" class="view active">
    __CARDS__
    <div class="foot">Live from /api/glance · pull-to-refresh by reopening</div>
  </div>
  <div id="chat" class="view">
    <div class="bubble agent">Morning! Dinner's set &mdash; sheet-pan chicken. Want the missing items on your grocery list?</div>
    <div class="bubble user">yes, and what's my dining-out spend this month?</div>
    <div class="bubble agent">Added them. Dining is about 18% under last month.</div>
    <div class="note">This panel is a sample. For a live conversation, run the <b>Glance Chat</b> script &mdash; it posts to /api/chat and the agent answers for real.</div>
  </div>
<script>
  function show(which) {
    document.getElementById('tabGlance').classList.toggle('active', which === 'glance');
    document.getElementById('tabChat').classList.toggle('active', which === 'chat');
    document.getElementById('glance').classList.toggle('active', which === 'glance');
    document.getElementById('chat').classList.toggle('active', which === 'chat');
  }
</script>
</body>
</html>
`;
  return TEMPLATE
    .replace("__CARDS__", cardsHtml(cards))
    .replace("__STATUS__", live ? "Live data from the backend" : "Offline — showing sample data");
}

async function main() {
  const fetched = await fetchCards();
  const cards = fetched || MOCK_CARDS;
  const wv = new WebView();
  await wv.loadHTML(pageHtml(cards, !!fetched));
  await wv.present(true);
  Script.complete();
}

main();
