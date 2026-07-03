# MediFind Pharmacy Dashboard

Web dashboard for pharmacy owners to manage their MediFind AI listing: profile
(including 24-hour status), inventory, and incoming reservations.

Not part of the Android app — this is a separate website, built with
React + Vite + Tailwind CSS v4, meant for pharmacy owners on desktop or mobile
browser.

## Stack

- React 19 + Vite
- Tailwind CSS v4 (`@tailwindcss/vite` plugin — no `tailwind.config.js`,
  theme tokens live in `src/index.css` under `@theme`)
- react-router-dom v7
- axios

## Local setup

```bash
npm install
cp .env.example .env   # already points at the live Render backend
npm run dev
```

Visit `http://localhost:5173`. Log in with `pharmacy@test.com` / `pass123`.

## Backend requirements

This dashboard depends on endpoints added during Phase 7 planning:

- `GET /api/pharmacies/mine` — owner's own pharmacy (must exist before login works)
- `PUT /api/pharmacies/:id` — update profile / is24Hours
- `GET /api/inventory/:pharmacyId`, `PUT /api/inventory/:pharmacyId`,
  `DELETE /api/inventory/:pharmacyId/:medicineId`
- `GET /api/reservations/pharmacy/:pharmacyId`, `PUT /api/reservations/:id/status`
- `GET /api/medicines?name=` — **assumed** to exist for the "add medicine"
  search; confirm the shape matches (`name`, `genericName`, `_id` fields)

Make sure all of these are committed, pushed, and live on Render before
testing the dashboard end-to-end.

## Deploying to Render (free Static Site)

1. Push this project to its own GitHub repo (e.g. `medifind-pharmacy-dashboard`)
2. In Render: **New +** → **Static Site** → connect the repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL` =
   `https://medifind-backend-9ifw.onrender.com/api`
6. Add a rewrite rule so client-side routing works on refresh:
   Source `/*` → Destination `/index.html` → Action `Rewrite`
   (Render Static Sites: Settings → Redirects/Rewrites)

Render Static Sites are free with no billing account required, consistent
with the rest of this project's hosting.

## Design

"Apothecary ledger" visual direction — deep bottle-green, warm paper
background, amber and rust accents for status, Zilla Slab for display type,
Inter for body, IBM Plex Mono for numbers/data. Tokens are in
`src/index.css`.

## Known gaps / next steps

- Analytics revenue is an **estimate**: current inventory price × confirmed
  reservations, not a historical snapshot (Reservation model has no
  price/qty field — see project state doc for the tradeoff discussion).
- `searchMedicines` in `src/api/endpoints.js` assumes `GET /medicines?name=`
  — confirm this matches your actual medicine search route.
- No pagination on inventory/reservations lists — fine for MVP test data
  volume, revisit if lists grow large.
