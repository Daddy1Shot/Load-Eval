# Take This Load? 🚚

**Version 2.3**

A deadhead-aware courier load evaluator. Tells you in ~15 seconds whether a gig-app load will **make money or waste your time** — by counting the unpaid empty miles the app hides from you.

Works fully offline. Installs to your phone like a real app.

---

## Why it exists

Gig apps show you `$20 for 25 miles` — but that's only the **loaded leg** (pickup → dropoff). Your real trip is:

```
Home → Pickup     (deadhead — unpaid)
Pickup → Dropoff  (loaded — the only leg they pay for)
Dropoff → Home    (deadhead — unpaid; skip it with the "Staying out" toggle)
```

So a "25-mile load" might be 50+ real miles. This app judges the payout against **total route miles**, so you see the truth: that $20 load is really ~$0.40/mile and a money-loser, not the $0.80/mile it looked like.

---

## The two numbers that matter

| Number | What it means |
|---|---|
| **$/total-mile** | The truth. Counts every mile you drive. **This drives the verdict.** |
| **$/loaded-mile** | What the app implied. Shown so you see how much the deadhead ate. |

The verdict is one of:
- 🟢 **GOOD** — beats your good line ($/mile) and clears your $/hour floor
- 🟡 **MARGINAL** — pays the bills but isn't a winner (tells you why + what would fix it)
- 🔴 **REJECT** — below your floor or loses money (tells you why **and what payout would flip it**)

---

## Features

- **Deadhead-aware routing** — four points (Home → Pickup → Dropoff → Return). "Staying out" toggle zeroes the return leg when you're waiting near a hot pickup zone.
- **Weight-driven fuel cost** — cargo weight cuts MPG on the *loaded leg only* (empty legs stay at baseline). Calibrated to a Ram ProMaster 1500: 13 MPG empty → 10 MPG at a full 3,500 lb load. Tunable in Settings.
- **Pickup wait buffer** — auto-calculated drive time gets a configurable wait added (default 30 min, since Lowe's runs slow) so your $/hour is honest. Editable per load.
- **Saved pickups** — save your common Lowe's locations as tap-chips that fill the pickup field in one tap.
- **Load log + CSV export** — save evaluated loads, then export them all as a CSV via your phone's share sheet (email it to yourself, send to Drive) for later analysis.
- **Address auto-fill** — type addresses, tap to fill miles and time. Optional; manual entry always works.
- **Verdict explanations** — rejections and marginals tell you *why* and *what would change the call*.
- **Version label + manual update** — the running version shows on the main screen; a "Check for updates" button in Settings forces a fresh pull if the app ever caches an old copy.

---

## Your baseline defaults

All editable in ⚙ Settings:

| Setting | Default |
|---|---|
| Vehicle | Cargo Van |
| Empty MPG | 13 |
| Wear & tear | $0.15 / mile |
| Working max load | 3,500 lbs |
| MPG lost at max load | 3 (so 13 → 10 at full load) |
| Pickup wait buffer | 30 min |
| Reject floor | $0.75 / total-mile |
| Good-load line | $1.25 / total-mile |
| Min $/hour floor | $20 / hr |
| Fuel price | $3.72 / gal (Texas avg — manual update) |
| Home base | (set this once — easy to change when you relocate) |

> **Tuning tip:** the $20/hr floor is a starting guess. After a week of real loads, raise it if it's rejecting decent runs or lower it if it's letting junk through — one field in Settings. Once the pickup-wait buffer is counted, $/hour numbers come out lower (and more honest) than drive-time-only.

---

## Deploy to GitHub Pages

### New repo
1. Create a repo (e.g. `Load-Eval`), set it **Public**.
2. **Add file → Upload files** and drag in all the loose files (not the folder): `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, and the `.md` docs.
3. **Settings → Pages → Deploy from a branch → `main` / root → Save.**
4. Live at `https://<username>.github.io/<repo>/` after ~1 minute.

### Updating an existing deploy
- Upload the changed files over the old ones (same filename = overwrite), commit. **When the service worker (`sw.js`) changes, upload it too**, not just `index.html`.
- The version label on the main screen tells you which build is live. If your phone shows an old version, use **⚙ → App → Check for updates & reload**, or delete the home-screen app and re-add it from the URL once.

### Install to your phone
- **iPhone (Safari):** open the URL → Share → **Add to Home Screen**.
- **Android (Chrome):** open the URL → menu (⋮) → **Install app**.

---

## Optional: auto-fill miles from addresses (free)

The app works perfectly with **manual miles**. To type addresses instead and have miles filled for you, add a free distance key.

### Distancematrix.ai (recommended — free, no credit card)
1. Sign up at **https://distancematrix.ai**.
2. Copy your **Distance Matrix → Accurate** API key (free tier = 1,000 elements/month, no card).
3. In the app: **⚙ → APIs** → Provider: **Distancematrix.ai** → paste key → **Save**.
4. On a load, fill Home / Pickup / Dropoff → tap **"Auto-fill miles & time."**

**Usage math:** the app makes **3 paired one-to-one lookups per trip** (one per leg = 3 billable elements; only 2 if "Staying out" is on). At 1 element each, 1,000 free elements ≈ **~330 trips/month**.

> Note: an earlier build requested a 3×3 matrix that billed 9 elements/trip but used only 3 — fixed in v2.2 to bill just the legs actually driven.

### Google (alternative)
Provider "Google Compute Route Matrix" is also built in, but a Google key needs referrer restrictions or a proxy to work from a browser (CORS). Distancematrix.ai is the simpler choice for a static site.

### If a lookup fails
No problem — the app tells you to type miles manually. Every calculation works identically with or without the API. (Tip: give it a full address with city/state; a bare street number can fail to resolve.)

---

## Fuel price

The Texas average ($3.72/gal) is pre-loaded; update it anytime in **⚙ → Fuel**. There's **no live fuel-price API** wired — reliable free ones don't exist (Distancematrix.ai is distance-only, and the dedicated fuel APIs are paid). The ↻ button by the fuel banner just re-applies your saved default. For a go/no-go tool, a manually-updated price within a few cents is plenty accurate.

---

## How the math works

```
total_miles    = leg1 + leg2 + leg3            (leg3 = 0 if "Staying out")
loaded_mpg     = max(10, empty_mpg − (cargo_lbs / max_lbs) × mpg_drop)
fuel_loaded    = (leg2 / loaded_mpg) × fuel_price
fuel_deadhead  = ((leg1 + leg3) / empty_mpg) × fuel_price     ← empty legs at full MPG
fuel_cost      = fuel_loaded + fuel_deadhead
wear_cost      = total_miles × 0.15
profit         = payout − fuel_cost − wear_cost
$/total-mile   = payout / total_miles           ← drives the verdict
$/loaded-mile  = payout / leg2
$/hour         = profit / hours                  ← after costs; includes pickup wait
```

---

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (UI + engine + API modules + log + settings) |
| `manifest.json` | PWA install config |
| `sw.js` | Service worker — offline support + update handling |
| `icon-192.png` / `icon-512.png` | App icons |
| `README.md` | This file |
| `ROADMAP.md` | Version history + planned features |
| `PROJECT-SUMMARY.md` | Full project write-up (incl. community-share guidance) |

---

## Version history

- **v1** — Core verdict engine, four-point deadhead routing, manual miles, PWA, GitHub Pages deploy.
- **v1.x** — Wired Distancematrix.ai + Google as swappable distance providers; Texas fuel default.
- **v2** — Weight-driven loaded-leg MPG (ProMaster 1500 curve); saved-pickup quick-fill chips.
- **v2.1** — Pickup wait-time buffer; load log with CSV export via share sheet.
- **v2.2** — API cost fix: 3 paired leg lookups (3 elements/trip) instead of a 3×3 matrix (9). ~110 → ~330 free trips/month.
- **v2.3** — Version label on main screen; "Check for updates & reload" button in Settings; network-first caching so updates land automatically.

---

## Planned (not yet built)

- **Quoting mode** — your own contract pricing (base rate + included first 15–20 mi + per-mile after).
- Multiple vehicle profiles (car / SUV / pickup / van).
- Per-pickup wait buffers (slow Lowe's vs. fast warehouse).
- Revisit saved locations after relocating, depending on how the gig apps surface pickup data.

---

*Settings, saved pickups, your API key, and your load log all stay on your device. No login, no tracking, no server.*
