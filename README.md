# Take This Load? 🚚

A deadhead-aware courier load evaluator. Tells you in ~15 seconds whether a gig-app load will **make money or waste your time** — by counting the unpaid empty miles the app hides from you.

Built for the cargo van. Works fully offline. Installs to your phone like a real app.

---

## Why it exists

Gig apps show you `$20 for 25 miles` — but that's only the **loaded leg** (pickup → dropoff). Your real trip is:

```
Home → Pickup     (deadhead — unpaid)
Pickup → Dropoff  (loaded — the only leg they pay for)
Dropoff → Home    (deadhead — unpaid)
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
- 🟡 **MARGINAL** — pays the bills but isn't a winner (tells you why)
- 🔴 **REJECT** — below your floor or loses money (tells you why **and what payout would flip it**)

---

## Your baseline defaults

These are pre-set and editable anytime in ⚙ Settings:

| Setting | Default |
|---|---|
| Vehicle | Cargo Van |
| MPG | 13 |
| Wear & tear | $0.15 / mile |
| Reject floor | $0.75 / total-mile |
| Good-load line | $1.25 / total-mile |
| Min $/hour floor | $20 / hr |
| Fuel price | $3.72 / gal (Texas avg) |
| Home base | (set this once — easy to change when you relocate) |

> **Tuning tip:** The $20/hr floor is a starting guess. After a week of real loads, if it's rejecting decent runs (raise it) or letting junk through (lower it), change the one field in Settings.

---

## Deploy to GitHub Pages

Same pattern as the Clean Latrine dispatch PWA.

### Option A — new repo
1. Create a new repo (e.g. `load-eval`).
2. Upload all files from this folder: `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `README.md`.
3. Repo **Settings → Pages → Source: Deploy from a branch → `main` / root → Save**.
4. Wait ~1 minute. Your app is live at `https://<your-username>.github.io/load-eval/`.

### Option B — subfolder of an existing repo
1. Drop this whole folder into your existing Pages repo (e.g. as `/load-eval/`).
2. App is live at `https://<your-username>.github.io/<repo>/load-eval/`.

### Install to your phone
- **iPhone (Safari):** open the URL → Share → **Add to Home Screen**.
- **Android (Chrome):** open the URL → menu (⋮) → **Install app / Add to Home Screen**.

Once installed it runs offline — only the optional address lookup needs internet.

---

## Optional: auto-fill miles from addresses (free)

The app works perfectly with **manual miles** — type each leg by hand and everything calculates. If you'd rather type addresses and have it fill the miles for you, add a free distance key.

### Distancematrix.ai (recommended — free, no credit card)
1. Go to **https://distancematrix.ai** and sign up for a free account.
2. Copy your **API key** (free tier = 1,000 lookups/month, no card required).
3. In the app: **⚙ → APIs** section:
   - Provider: **Distancematrix.ai**
   - Paste your key into **Distance API key**
   - **Save**
4. On a load, fill in Home / Pickup / Dropoff addresses → tap **"Auto-fill miles & time."**

**Usage math:** the app makes **3 paired one-to-one lookups per trip** (one per leg = 3 billable elements; only 2 if you toggle "Staying out"). At 1 element each, 1,000 free elements ≈ **~330 trips/month**. An earlier build used a 3×3 matrix that billed 9 elements/trip — fixed in v2.2 to bill only the 3 legs actually used.

### Google (alternative)
Provider "Google Compute Route Matrix" is also built in, but a Google key needs referrer restrictions or a proxy to work from a browser (CORS), and Google's free pricing changed in March 2025. Distancematrix.ai is the simpler choice for a static site — use Google only if you already have a working key.

### If a lookup fails
No problem — the app just tells you to type the miles manually. Every calculation works identically with or without the API.

---

## Fuel price

The Texas average ($3.72/gal) is pre-loaded. Update it anytime in **⚙ → Fuel**. (There's no auto-fuel-API wired by default — clean free fuel-price feeds are unreliable, so this stays a quick manual field. The ↻ update button re-applies your saved default.)

---

## How the math works

```
total_miles   = leg1 + leg2 + leg3          (leg3 = 0 if "Staying out" is on)
fuel_cost     = (total_miles / mpg) × fuel_price
wear_cost     = total_miles × 0.15
profit        = payout − fuel_cost − wear_cost
$/total-mile  = payout / total_miles         ← drives the verdict
$/loaded-mile = payout / leg2                 ← shown for contrast
$/hour        = profit / hours                ← after costs
```

`$/total-mile` uses gross payout (matches how you eyeball offers). `$/hour` uses profit after costs (is your time worth it).

---

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (UI + engine + API modules) |
| `manifest.json` | PWA install config |
| `sw.js` | Service worker — offline support |
| `icon-192.png` / `icon-512.png` | App icons |

---

## What's deferred (Phase 2 ideas)

Built with clean seams so these can be added later:
- **Quoting mode** — your own contract pricing (base rate + included first 15–20 mi + per-mile after). Different from gig mode, where the app sets the price.
- Multiple vehicle profiles (car, SUV, pickup, sprinter).
- Load history / running "what I actually earned" log.
- Auto fuel-price API.

---

*v1 — June 2026. Settings stay on your device. No login, no tracking, no server.*
