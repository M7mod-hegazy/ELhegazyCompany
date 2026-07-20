# Screenshot shot list — world pages

Drop each screenshot as a PNG at the exact path below. The page auto-detects it and
replaces the labelled placeholder — no code change needed. Capture on a clean, real
dataset (Arabic UI), full app window, no personal data.

Tip: 16:10-ish framing for `app`/`browser` shots, tall for `thermal`/`phone`, A4 portrait for `a4`.

## POS — `/products/pos`  → files in `public/shots/pos/`

| File | Screen / exact state to capture |
|---|---|
| `pos-checkout.png` | POS sale screen mid-checkout, the **split-payment (متعدد)** modal open with an **installment plan** visible. |
| `shift-close.png` | Shift-close reconciliation modal (**expected vs. counted** cash). |
| `treasury-ledger.png` | الخزينة اليومية — the **cashflow ledger** with the running balance column. |
| `stock-transfer.png` | Stock transfer between branches/warehouses. |
| `physical-count.png` | Physical count / stock-take sheet. |
| `reports-center.png` | Reports Center — the **card grid** with Arabic preview data. |
| `owner-dash.png` | لوحة صاحب المحل — the owner's one-screen day summary. |
| `whatsapp-crm.png` | WhatsApp CRM — inbox + **campaigns** view. |
| `print-designer.png` | The drag-and-drop **print designer** canvas. |
| `receipt-80.png` | 80mm thermal receipt **preview** (tall). |
| `backup.png` | Backup & restore screen. |
| `mod-restaurant.png` | Restaurant mode — the **table map**. |
| `mod-gold.png` | Gold daily-rates screen. |
| `mod-serials.png` | Serial/IMEI lookup with warranty. |
| `mod-pharmacy.png` | Expiry report (FEFO). |
| `mod-clothing.png` | An item with a **size × color** matrix. |
| `mod-repair.png` | A repair / service work-order. |

## Video (per world)

The explainer video is a placeholder until you set the source. When ready, edit
`src/config/worlds.ts` → `worlds.pos.video`:
- `provider`: `"youtube"` or `"vimeo"` (or `"mux"`/`"file"` later)
- `id`: the video id (e.g. YouTube `dQw4...`)
- `chapters[].t`: adjust each timestamp (seconds) to match your recording.

That's it — the theater plays the real video with a seekable chapter rail.

_(Marketing `/services/marketing` and E-commerce `/products/ecommerce` shot lists added when those worlds are built.)_
