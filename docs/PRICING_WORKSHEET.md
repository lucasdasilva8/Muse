# Muse Pricing Worksheet v0

Use this with real artist inputs. No sample/fake numbers included.

Companion to `MUSE_PRODUCT_PLAN.md` §5.

---

## Inputs (artist + Muse)

| Field | Symbol | Value | Notes |
|-------|--------|-------|-------|
| Disclosed annual defined net | `V_ann` | | Trailing 12 mo or run-rate of *included* categories only |
| Revenue quality | `Q` | | Self-reported 0.5–0.7 · Docs 0.85–0.95 · Linked 1.0 |
| Traction factor | `G` | | Manual in pilots; clamp ~0.7–1.3 |
| Revenue share sold | `S` | | Decimal (15% → 0.15) |
| Term (months) | `T` | | |
| Cap multiple | `C` | | e.g. 1.5; required recommended in pilots |
| Raise requested by artist | `R_ask` | | What they want |
| Included categories | | | Streaming / sync / merch / other |

---

## Calculated fields

```
V_adj = V_ann × Q × G

R_suggested = (S × V_adj × (T / 12)) / C

V_implied = R / S
        (use final approved R)

If using shares:
  N = ________
  P = R / N

If using pool % (recommended v1):
  fan_fraction = amount_invested / R
```

| Output | Formula | Value |
|--------|---------|-------|
| `V_adj` | `V_ann × Q × G` | |
| `R_suggested` | `(S × V_adj × T/12) / C` | |
| Approved `R` | Muse + artist | |
| `V_implied` | `R / S` | |
| Risk label | ops judgment | |

---

## Guardrails (set policy numbers when ready)

| Rule | Policy value | Pass? |
|------|--------------|-------|
| Min `Q` to list publicly | | |
| Max `R / V_adj` | | |
| Min / max `S` | | |
| Min / max `T` | | |
| Cap `C` required? | Yes (pilots) | |
| Identity verified? | | |
| Docs reviewed? | | |

---

## Payout (per period)

```
defined_net_period = ________

pool_amount = S × defined_net_period

fan_payout = (fan_invested / R) × pool_amount

cumulative_pool_paid = previous + pool_amount
stop if cumulative_pool_paid ≥ C × R  OR  months_elapsed ≥ T
```

| Period | Defined net | Pool (`S × net`) | Cumulative to pool | Cap remaining |
|--------|-------------|------------------|--------------------|---------------|
| | | | | |

---

## Muse fees

| Fee | Rate | On |
|-----|------|----|
| Raise fee | | `R` at close |
| Payout fee | | each distribution |

---

## Decision

- [ ] Approve listing at `R` = ______
- [ ] Request changes: ______
- [ ] Reject: ______

Reviewer: ____________  Date: ____________
