// Personal Agent — Conversational Agent (functional native client)
// ---------------------------------------------------------------------------
// A working on-device chat client for the backend's POST /api/chat. Uses native
// Scriptable Alerts for input/output and Request for the HTTP call, so it needs
// no WebView, no CORS, and no API key on the phone (the server holds the key).
//
// Requires the server running with ANTHROPIC_API_KEY set. Point BASE_URL at the
// server's LAN IP for use on a phone. See README.md.
// ---------------------------------------------------------------------------

const BASE_URL = "http://localhost:3000";

async function ask(history) {
  const req = new Request(`${BASE_URL}/api/chat`);
  req.method = "POST";
  req.headers = { "Content-Type": "application/json" };
  req.body = JSON.stringify({ messages: history });
  req.timeoutInterval = 60;
  return req.loadJSON();
}

async function main() {
  const history = [];
  for (;;) {
    const prompt = new Alert();
    prompt.title = "Ask your agent";
    prompt.message = "Kitchen · projects · news · finance — one brain.";
    prompt.addTextField("e.g. how's grocery spending?", "");
    prompt.addAction("Send");
    prompt.addCancelAction("Done");
    const choice = await prompt.present();
    if (choice === -1) break;

    const text = (prompt.textFieldValue(0) || "").trim();
    if (!text) continue;
    history.push({ role: "user", content: text });

    let reply;
    try {
      const json = await ask(history);
      reply = json.reply || json.error || "(no reply)";
    } catch (e) {
      reply = `Couldn't reach the server at ${BASE_URL}\n${e.message}`;
    }
    history.push({ role: "assistant", content: reply });

    const out = new Alert();
    out.title = "Agent";
    out.message = reply;
    out.addAction("Ask again");
    out.addCancelAction("Done");
    const next = await out.present();
    if (next === -1) break;
  }
  Script.complete();
}

main();
