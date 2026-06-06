# Roadmap — Take This Load?

Status: **v1 + v2 + v2.1 shipped.** v2 added weight-driven loaded-leg MPG and saved pickups. v2.1 added a pickup-wait time buffer and a load log with CSV export. v3 (below) is still planned, not built.

---

## Vehicle of record

**Ram ProMaster 1500 — High Roof, 136" WB**, 3.6L Pentastar V6, 9-speed auto, FWD.
- GVWR: 8,550 lbs
- Manufacturer payload ceiling: ~3,800–4,000 lbs
- **Realistic working max payload: 3,500 lbs** (Kory's number — use this to anchor the curve, not the theoretical max)
- Baseline empty MPG: **13** (slightly conservative vs real-world 15–18; keep as-is)
- Loaded-heavy MPG: ~10–11 (owner-reported range for this drivetrain)

---

## v2 — two additions

### 1. Weight-driven MPG (the main one)

**Goal:** the cargo weight you type adjusts fuel cost realistically — but only on the **loaded leg** (pickup → dropoff). The two deadhead legs are empty, so they always calculate at the full 13 MPG.

**Why it matters:** at $3.72/gal over a ~50-mile trip, dropping the loaded leg from 13 to ~10.5 MPG adds ~$3–4 in fuel. On a $20–40 gig load, that $3–4 is exactly what separates *marginal* from *reject*. Small input, real decision impact.

**The curve (calibrated to this van, anchored at 3,500 lb working max):**

| Cargo weight (loaded leg) | Loaded-leg MPG |
|---|---|
| 0 – 500 lbs | 13.0 (baseline) |
| ~1,000 lbs | ~12.3 |
| ~1,750 lbs | ~11.7 |
| ~2,500 lbs | ~11.0 |
| ~3,500 lbs | ~10.0 |

**Formula (linear, floored):**
```
loaded_mpg = max( 10, baseline_mpg − (cargo_lbs / 3500) × 3 )
```
- `baseline_mpg` = 13 (from Settings, editable)
- The `× 3` means a full 3,500-lb load costs you ~3 MPG (13 → 10). Floor at 10 so it never goes unrealistic.
- Empty / no weight entered → loaded_mpg = baseline = 13 (no change from v1 behavior).

**Engine change:**
```
fuel_loaded   = (loaded_leg_miles / loaded_mpg) × fuel_price
fuel_deadhead = (deadhead_miles  / baseline_mpg) × fuel_price   ← always 13 MPG
fuel_cost     = fuel_loaded + fuel_deadhead
```
Everything downstream (profit, $/mile, $/hour, verdict) stays the same — only the fuel number gets more honest.

**Calibration knob:** expose the "MPG drop at max load" as one editable Settings field (default 3). After a few real heavy runs, if the van feels worse (~10 at lighter loads) Kory bumps it; if better, lowers it. The weight field already exists in v1 UI — v2 just wires it into the math instead of it being informational-only.

**Open calibration question (tune after real loads):** does a packed van feel like ~11, ~10, or ~12 MPG? Kory's seat-of-the-pants number beats the spec sheet. Default curve above stands until then.

### 2. Saved locations (lighter-weight version)

**Goal:** quick-fill Home and common Pickups (Lowe's stores Kory gets dispatched from) with a tap instead of typing addresses each load.

**Scope for v2 — keep it minimal:**
- A small saved-locations list in Settings (label + address): Home + a handful of known Lowe's.
- On the load screen, a tap-to-fill chip/dropdown for Home and Pickup.
- That's it. No auto-import, no big database.

**Known workflow constraint this works around:** the gig app hides the pickup location until you accept, and accepting-then-rejecting dings the driver rating. But pickups are almost always a known Lowe's, so pre-saving 2–3 of them lets Kory pick the likely one at offer time and recover the Home→Pickup deadhead leg before committing. Dropoff→Home stays a manual estimate until accepted (often the dropoff is shown or roughly known).

---

## v3 — revisit saved locations

After the move to a new city, a lot of new pickup/dropoff locations will appear. Hand-maintaining a saved-locations database could get time-consuming and not worth it.

**Decision to make in v3 (evidence-based, after watching how the apps behave post-move):**
- If gig apps end up surfacing pickup/dropoff data in a usable way → **remove or shrink** the manual saved-locations feature and lean on what the apps provide.
- If they don't → keep saved locations but maybe add light import/cleanup tooling.

Don't build a big location database by hand until it's clear the apps won't feed that data automatically.

---

## Not changing

- Distancematrix.ai stays the default distance provider (free tier, 3 paired leg lookups = 3 elements/trip).
- Fuel price stays a manual field (Texas avg default) — no reliable free fuel API worth wiring.
- Core verdict logic, thresholds, and the deadhead-aware total-mile model are settled and working.

---

*Roadmap as of June 2026. v1 is live; build v2 when ready.*
