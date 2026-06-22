# Glance Surface — Visual MVP (Scriptable)

Stage 0 prototype per [`docs/architecture.md`](../../docs/architecture.md) (Decision 001).

**What this is:** a *visual-only* glanceable widget you can run on your iPhone to feel
the multi-domain "cards at a glance" pattern. It shows mock data for five domains
(dinner, spending, markets, top story, project nudge).

**What this is NOT:** there is no backend, no live data, and no real functionality —
all values are hardcoded placeholders. This exists purely to test the visual pattern.

---

## Run it on your phone (≈3 minutes)

1. **Install Scriptable** (free) from the App Store: https://apps.apple.com/app/scriptable/id1405459188
2. **Create the script:**
   - Open Scriptable → tap **+** (top-right) to make a new script.
   - Delete the placeholder text.
   - Open [`glance-widget.js`](./glance-widget.js), copy its **entire** contents, and
     paste into the new script. *(On GitHub use the "Copy raw file" button; or open
     the file on your phone and copy all.)*
   - Tap the script's name at the top and rename it to **Glance** → Done.
3. **Preview in-app first (optional):** tap the **▶︎ play** button at the bottom. You
   should see the large card render. To preview other sizes, change `PREVIEW_FAMILY`
   near the top of the script to `"small"`, `"medium"`, `"accessoryRectangular"`, etc.
4. **Add the Home Screen widget:**
   - Long-press an empty area of the Home Screen → tap **+** (top-left) → search
     **Scriptable** → pick a size (Medium or Large shows the most) → **Add Widget**.
   - Long-press the new widget → **Edit Widget** → set **Script** = *Glance*.
   - (Leave "When Interacting" as *Run Script* or *Open App*.)
5. **Add a Lock Screen widget (optional):** lock-screen long-press → **Customize** →
   **Lock Screen** → tap a widget slot → choose **Scriptable** → set Script = *Glance*.
   The script auto-detects the accessory size and renders the compact layout.

That's it — you're running the visual MVP. The widget refreshes on iOS's own schedule
(roughly every 15–60 min); since the data is static mock data, refresh timing doesn't
matter here.

---

## Run the main-app screen mockup ([`glance-app.js`](./glance-app.js))

This is the full-screen experience you'd tap into from the widget: a richer dashboard
plus the conversational-agent (chat + voice) UI. It's a visual mockup rendered in a
full-screen WebView — mock data only, the only interaction is the **Glance / Chat**
toggle so you can see both views.

1. In Scriptable, tap **+** to make another new script; paste the contents of
   [`glance-app.js`](./glance-app.js); rename it to **Glance App** → Done.
2. Tap the **▶︎ play** button to launch it full-screen. Tap **Glance** / **Chat** at the
   top to switch views. Swipe down / Done to dismiss.
3. *(Optional, to launch it from the Home Screen):* add a Scriptable widget set to the
   **Glance App** script with "When Interacting" = **Run Script** — tapping it opens the
   mockup. *(Wiring the glance widget itself to deep-link into this screen is a Stage 1
   nicety; for now run the two scripts independently.)*

## Notes

- **Both phones:** repeat steps 1–4 on your wife's iPhone (install the free app, paste
  the same script). No accounts or provisioning needed.
- **Sizes supported:** Home Screen `small` / `medium` / `large`; Lock Screen
  `accessoryRectangular` / `accessoryCircular` / `accessoryInline`.
- **Editing the look:** colors and mock values live at the top of `glance-widget.js`
  (the `MOCK` and `C` objects) — tweak freely to try layouts.

## Verifying the script (programmatic check)

Per the repo's workflow guidance, the script is syntax-checked programmatically:

```sh
npm run check
```

This runs `node --check` over the script. Note: full unit testing isn't applicable —
the script depends on Scriptable's iOS-only runtime globals (`ListWidget`, `SFSymbol`,
`config`, `Script`, …) that don't exist in Node, so the meaningful functional test is
running it on-device in Scriptable.
