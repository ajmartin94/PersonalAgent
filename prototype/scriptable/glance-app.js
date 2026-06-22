// Personal Agent — Main App Screen (Visual MVP)
// ---------------------------------------------------------------------------
// Stage 0 prototype per docs/architecture.md (Decision 001).
// PURPOSE: validate the *visual* pattern of the full-screen "main app" you tap
// into from the glance widget — the richer dashboard plus the conversational
// agent (chat + voice) UI.
//
// VISUAL ONLY: every value and message is hardcoded MOCK data. There is no
// backend, no network, and no real conversation. The only interactivity is a
// segmented control to switch between the Glance and Chat views, so you can
// see both — that's presentation, not functionality.
//
// Renders a full-screen WebView via Scriptable (free app, no Apple Developer
// account). Run it directly (tap the play button, or a Scriptable "Run Script"
// Home Screen widget). See README.md for details.
// ---------------------------------------------------------------------------

const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>
  :root {
    --bg0:#1b1b2b; --bg1:#0d0d15; --card:#1f1f30; --card2:#262639;
    --text:#ffffff; --sub:#9a9aad; --value:#c7c7d6;
    --dinner:#ff8c66; --finance:#5fd0a0; --markets:#6db3ff; --news:#c89bff; --project:#ffd166;
    --accent:#6db3ff;
  }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  html,body { margin:0; height:100%; }
  body {
    font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;
    background:linear-gradient(180deg,var(--bg0),var(--bg1));
    color:var(--text);
    padding:max(14px,env(safe-area-inset-top)) 14px max(14px,env(safe-area-inset-bottom));
    -webkit-user-select:none; user-select:none;
  }
  .header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .avatar { width:38px; height:38px; border-radius:50%;
    background:linear-gradient(135deg,#6db3ff,#c89bff); flex:0 0 auto; }
  .greet { font-size:17px; font-weight:600; line-height:1.1; }
  .date { font-size:12px; color:var(--sub); margin-top:2px; }

  .seg { display:flex; background:var(--card); border-radius:11px; padding:3px; margin-bottom:14px; }
  .seg button { flex:1; border:0; background:transparent; color:var(--sub);
    font-size:13px; font-weight:600; padding:7px 0; border-radius:8px; font-family:inherit; }
  .seg button.active { background:var(--card2); color:var(--text); }

  .view { display:none; }
  .view.active { display:block; }

  .card { display:flex; align-items:flex-start; gap:12px;
    background:var(--card); border-radius:14px; padding:13px 14px; margin-bottom:10px; }
  .badge { width:34px; height:34px; border-radius:10px; flex:0 0 auto;
    display:flex; align-items:center; justify-content:center; font-size:17px;
    background:rgba(255,255,255,0.06); }
  .card .body { flex:1; min-width:0; }
  .card .title { font-size:15px; font-weight:600; }
  .card .value { font-size:14px; color:var(--value); margin-top:2px; }
  .card .sub { font-size:12px; color:var(--sub); margin-top:3px; }
  .pill { font-size:11px; color:var(--sub); }

  /* Chat */
  #chat { display:none; flex-direction:column; height:calc(100vh - 150px); }
  #chat.active { display:flex; }
  .msgs { flex:1; overflow:auto; display:flex; flex-direction:column; gap:9px; padding-bottom:8px; }
  .bubble { max-width:80%; padding:9px 12px; border-radius:16px; font-size:14px; line-height:1.35; }
  .agent { align-self:flex-start; background:var(--card2); border-bottom-left-radius:5px; }
  .user { align-self:flex-end; background:var(--accent); color:#06121f; border-bottom-right-radius:5px; }
  .inputbar { display:flex; align-items:center; gap:9px; padding-top:9px; }
  .field { flex:1; background:var(--card); border-radius:20px; padding:11px 15px;
    color:var(--sub); font-size:14px; }
  .mic { width:42px; height:42px; border-radius:50%; flex:0 0 auto;
    background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:19px; }
  .foot { text-align:center; font-size:10px; color:var(--sub); margin-top:12px; }
</style>
</head>
<body>
  <div class="header">
    <div class="avatar"></div>
    <div>
      <div class="greet">Good morning, Andrew</div>
      <div class="date">Monday, June 22</div>
    </div>
  </div>

  <div class="seg">
    <button id="tabGlance" class="active" onclick="show('glance')">Glance</button>
    <button id="tabChat" onclick="show('chat')">Chat</button>
  </div>

  <div id="glance" class="view active">
    <div class="card">
      <div class="badge" style="color:var(--dinner)">&#127860;</div>
      <div class="body">
        <div class="title">Sheet-pan chicken &amp; veg</div>
        <div class="value">Dinner tonight</div>
        <div class="sub">Prep 6:30 PM &middot; 35 min &middot; serves 4</div>
      </div>
    </div>
    <div class="card">
      <div class="badge" style="color:var(--finance)">&#128181;</div>
      <div class="body">
        <div class="title">$1,240 <span class="pill">/ $1,800 this month</span></div>
        <div class="value">Spending</div>
        <div class="sub">Groceries $90 over budget</div>
      </div>
    </div>
    <div class="card">
      <div class="badge" style="color:var(--markets)">&#128200;</div>
      <div class="body">
        <div class="title">AAPL 213.4 &#9650; &middot; VTI 280.1 &#9660;</div>
        <div class="value">Markets</div>
        <div class="sub">Watchlist &middot; +0.4% today</div>
      </div>
    </div>
    <div class="card">
      <div class="badge" style="color:var(--news)">&#128240;</div>
      <div class="body">
        <div class="title">Transit plan clears final vote</div>
        <div class="value">Top story</div>
        <div class="sub">3 sources &middot; 4 min read</div>
      </div>
    </div>
    <div class="card">
      <div class="badge" style="color:var(--project)">&#128296;</div>
      <div class="body">
        <div class="title">Order shelving brackets</div>
        <div class="value">Garage project</div>
        <div class="sub">Next: measure wall &middot; due Sat</div>
      </div>
    </div>
    <div class="foot">Glance &middot; mock data &middot; no backend</div>
  </div>

  <div id="chat" class="view">
    <div class="msgs">
      <div class="bubble agent">Morning! Dinner's set &mdash; sheet-pan chicken. Want me to add the 3 missing items to your grocery list?</div>
      <div class="bubble user">yes, and what's my dining-out spend this month?</div>
      <div class="bubble agent">Added them. Dining out is $320 so far &mdash; about 18% under last month. Want a chart?</div>
      <div class="bubble user">later. remind me to call about the garage shelving</div>
      <div class="bubble agent">Done &mdash; filed under your Garage project with a nudge for Saturday.</div>
    </div>
    <div class="inputbar">
      <div class="field">Ask your agent&hellip;</div>
      <div class="mic">&#127908;</div>
    </div>
  </div>

<script>
  function show(which) {
    var g = document.getElementById('glance');
    var c = document.getElementById('chat');
    document.getElementById('tabGlance').classList.toggle('active', which === 'glance');
    document.getElementById('tabChat').classList.toggle('active', which === 'chat');
    g.classList.toggle('active', which === 'glance');
    c.classList.toggle('active', which === 'chat');
  }
</script>
</body>
</html>
`;

async function main() {
  const wv = new WebView();
  await wv.loadHTML(HTML);
  await wv.present(true); // fullscreen
  Script.complete();
}

main();
