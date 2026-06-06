# Take This Load? — Complete Project Summary

A deadhead-aware courier load evaluator (Progressive Web App). Tells a driver in ~15 seconds whether a gig-app load offer will **make money or waste their time** — by counting the unpaid empty miles the gig apps hide.

Built June 2026. Hosted on GitHub Pages. Intended to be shared with a driver community where each person supplies their own free API key.

---

## 1. The problem it solves

Gig apps (Roadie, Uber Connect, DoorDash, etc.) advertise a payout against the **loaded leg only** — pickup → dropoff. They hide the empty "deadhead" miles you drive to reach the pickup and to get home afterward. So a "$20 for 25 miles" offer might really be a 49-mile trip that pays $0.41/mile and *loses* money after fuel and wear.

This app evaluates every load as the **real route**:

```
Home → Pickup     (deadhead — unpaid)
Pickup → Dropoff  (loaded — the only leg the app pays for)
Dropoff → Home    (deadhead — unpaid; skippable if "staying out")
```

It judges payout against **total route miles**, and shows both `$/total-mile` (the truth) and `$/loaded-mile` (what the app implied) side by side so the deadhead drag is visible.

---

## 2. What it does (feature list)

**Core verdict engine**
- Enter payout + the route. Get an instant 🟢 GOOD / 🟡 MARGINAL / ⛔ REJECT verdict.
- Every rejection explains **why** and **what payout/terms would flip it** to acceptable.
- Marginal verdicts explain whether it's a per-mile or per-hour shortfall, and what would fix it.

**The numbers shown**
- Profit after costs, $/total-mile (drives verdict), $/loaded-mile (contrast), $/hour, total route with deadhead/loaded split, and a full cost breakdown (payout − fuel − wear = profit).

**Deadhead-aware routing**
- Four points: Home → Pickup → Dropoff → Return. Return defaults to home, editable.
- "Staying out" toggle zeroes the return leg (for waiting near a hot pickup zone).

**Weight-driven fuel cost**
- Cargo weight reduces MPG on the **loaded leg only** (empty deadhead legs stay at baseline).
- Calibrated to a Ram ProMaster 1500: 13 MPG empty → 10 MPG at a full 3,500 lb load.
- Tunable: "MPG lost at max load" and "working max load" are editable settings.

**Pickup wait buffer**
- Auto-calculated drive time is drive-only; the app adds a configurable wait (default 30 min) since pickups (e.g. Lowe's) run slow. Makes $/hour honest. Editable per load.

**Saved pickups**
- Save common pickup locations (Lowe's, etc.) as tap-chips that fill the pickup field in one tap — useful because gig apps hide the pickup until you accept, but it's usually a known store.

**Load log + CSV export**
- Save any evaluated load to a local log. Export all saved loads as a CSV via the phone's share sheet (email it to yourself, send to Drive, etc.) for later analysis.

**Distance auto-fill (optional)**
- Type addresses → tap "Auto-fill miles & time." Uses Distancematrix.ai (free tier) by default; Google is also wired as an alternate.
- Works fully without any API — manual mile entry always available.

**PWA**
- Installs to the phone home screen, works offline (only address lookups need network). Settings and log stored on-device. No login, no tracking, no server.

---

## 3. Baseline defaults (calibrated to the build owner's setup)

| Setting | Default | Notes |
|---|---|---|
| Vehicle | Cargo Van | label only |
| Empty MPG | 13 | Ram ProMaster 1500 3.6L, conservative |
| Wear & tear | $0.15 / mile | tires, oil, maintenance, depreciation |
| Working max load | 3,500 lbs | realistic, not the ~4,000 lb spec max |
| MPG lost at max load | 3 | 13 → 10 at full load |
| Pickup wait buffer | 30 min | Lowe's runs slow |
| Reject floor | $0.75 / total-mile | below = REJECT |
| Good-load line | $1.25 / total-mile | at/above = GOOD |
| Min $/hour floor | $20 / hr | a guess — tune from real logged data |
| Fuel price | $3.72 / gal | Texas avg, June 2026; manual update |

> **These are starting points.** Every value is editable in Settings. The $/hour floor especially should be re-tuned after logging real loads.

---

## 4. The calculation engine

```
total_miles    = leg1 + leg2 + leg3            (leg3 = 0 if "staying out")
loaded_mpg     = max(10, baseline_mpg − (cargo_lbs / max_lbs) × mpg_drop)
fuel_loaded    = (leg2_miles / loaded_mpg) × fuel_price
fuel_deadhead  = ((leg1 + leg3) / baseline_mpg) × fuel_price   ← always empty MPG
fuel_cost      = fuel_loaded + fuel_deadhead
wear_cost      = total_miles × wear_per_mile
profit         = payout − fuel_cost − wear_cost
$/total-mile   = payout / total_miles          ← drives the verdict (gross)
$/loaded-mile  = payout / leg2_miles            ← shown for contrast
$/hour         = profit / hours                 ← after costs

Verdict:
  REJECT   if profit ≤ 0  OR  $/total-mile < reject_floor
  GOOD     if $/total-mile ≥ good_line  AND  $/hour ≥ hour_floor
  MARGINAL otherwise
```

---

## 5. Build history (decisions log)

- **v1** — Core verdict engine, four-point deadhead routing, manual mile entry, settings, PWA shell, GitHub Pages deploy. Distance API stubbed as a swappable seam.
- **v1.x** — Wired Distancematrix.ai (free tier) and Google as swappable distance providers. Confirmed Texas fuel avg ($3.72) as default.
- **v2** — Weight-driven loaded-leg MPG curve (calibrated to ProMaster 1500). Saved-pickups quick-fill chips.
- **v2.1** — Pickup wait-time buffer (default 30 min) added to auto-calculated drive time. Load log with local storage + CSV export via share sheet.
- **v2.2** — **API cost fix.** Earlier builds requested a 3×3 distance matrix that billed 9 elements/trip but used only 3. Changed to 3 paired one-to-one leg lookups = 3 elements/trip (2 if staying out). Free tier capacity went from ~110 to ~330 trips/month.

**Key design principles held throughout:**
- Distance/fuel APIs are swappable behind manual override — the app never breaks if an API is down or absent.
- The verdict always runs on total route miles, never loaded-only.
- Every number is editable; nothing is hardcoded that a different driver/vehicle couldn't change.

---

## 6. Deployment (GitHub Pages)

Files: `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `README.md`, `ROADMAP.md`.

1. Create a repo (or use an existing one).
2. Upload all files to the repo root.
3. Settings → Pages → Deploy from a branch → `main` / root → Save.
4. Live at `https://<username>.github.io/<repo>/` after ~1 minute.
5. On phone: open the URL → Add to Home Screen (iPhone Safari) / Install app (Android Chrome).

First launch: open ⚙ Settings, tap Save once to write defaults, set home address, add saved pickups.

---

## 7. Sharing with a driver community

This app is built to be forked/shared. Each driver brings **their own free API key** — there is no shared key and no server, so there's no cost to the person who hosts it and no central bill.

**What each new user needs to do:**
1. **Get the app** — either use a shared hosted URL, or fork the repo and enable their own GitHub Pages (so they control their own copy).
2. **Get a free distance key (optional but recommended):**
   - Go to **distancematrix.ai** → sign up free (no credit card).
   - Copy the **Distance Matrix → Accurate** API key.
   - In the app: ⚙ → APIs → provider = Distancematrix.ai → paste key → Save.
   - Free tier = 1,000 elements/month ≈ ~330 trips. One key per person.
3. **Calibrate to their vehicle** — set their own MPG, wear, max load, MPG drop, thresholds, fuel price, and home base. The ProMaster/Texas defaults are just starting points.
4. **Use it** — evaluate loads, save the good ones to the log, export CSV to review their own numbers over time.

**Security notes for sharing:**
- **Never commit an API key into the repo.** Keys are entered in-app by each user and stored only on their own device (localStorage). The code ships with no key baked in.
- If anyone's key leaks, the worst case is someone burning their free 1,000 elements; they just regenerate it on distancematrix.ai.
- Because settings live on-device, one hosted copy can serve many drivers — each person's keys, vehicle profile, saved pickups, and log stay private to their phone.

**A community README could add:**
- A one-paragraph "what this is and why deadhead miles matter."
- The distancematrix.ai signup walkthrough (above).
- A reminder that the default numbers are one driver's van and everyone should set their own.
- The note that the app works fully with manual miles if someone doesn't want an API key.

---

## 8. Roadmap (not yet built)

- **Quoting mode** — the driver's *own* contract pricing (base rate + included first 15–20 mi + per-mile after), distinct from gig mode where the app sets the price.
- **Multiple vehicle profiles** — switch between car / SUV / pickup / van.
- **Revisit saved locations after relocation** — if gig apps surface pickup/dropoff data usably, shrink or remove the manual saved-locations feature rather than hand-maintain a database.
- **Per-pickup wait buffers** — different wait times per saved location (slow Lowe's vs. fast warehouse).
- **Auto fuel-price API** — currently a manual field; no reliable free fuel feed wired yet.

---

## 9. File manifest

| File | Purpose |
|---|---|
| `index.html` | The entire app — UI, calculation engine, API modules, log, settings |
| `manifest.json` | PWA install config |
| `sw.js` | Service worker (offline support) |
| `icon-192.png` / `icon-512.png` | App icons |
| `README.md` | User-facing setup & usage docs |
| `ROADMAP.md` | Version history + planned features |
| `PROJECT-SUMMARY.md` | This document |

---

*Summary as of June 2026. App is live and in real-world use; tuning the $/hour floor and weight curve from logged data is the next practical step.*
