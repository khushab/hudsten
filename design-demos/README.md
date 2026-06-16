# Hudsten — PDP redesign demos

Standalone, **throwaway** design mockups of the product page (PDP), used to choose a
visual direction for repositioning Hudsten from luxury → accessible-premium (masstige).
They do **not** touch `apps/storefront` — nothing here is wired to the real app.

## What's here

| File | Direction | Feel |
|---|---|---|
| `index.html` | Launcher | Pick/compare the three |
| `locker-room.html` | **Locker room** (recommended) | Athletic — midnight + electric blue + white |
| `daybreak.html` | **Daybreak** | Friendly warm DTC — oat + clay + sage |
| `bazaar.html` | **Bazaar** | Indian value-retail — trust-blue + savings-green + deal-amber |

Each page is **one self-contained HTML file** (inline CSS + JS), runs **offline** (no build
step), uses an inline **SVG** for product imagery (no external images), and shares the
**same product + copy** so only the design differs.

## How to view

Just open the launcher in a browser:

```bash
open design-demos/index.html        # macOS
```

Or open any single file directly. Try it: resize the window narrow to see the **mobile
layout + sticky “Order on WhatsApp” bar**, click a **colour swatch** to recolour the
gallery, switch **size**, and open the **FAQ** accordion.

## Notes

- Fonts load from Google Fonts here for convenience; the production build would self-host
  them via `next/font/local`.
- Content is honest by design: no fake reviews/ratings, no countdown timers, no fake MRP —
  reviews show an empty state, matching the brand's trust rules.
- Next step: pick (or blend) a direction, then it gets implemented at the design-token
  level (`packages/ui` + `apps/storefront`) in staged commits.
