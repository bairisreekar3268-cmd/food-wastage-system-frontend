# Food Wastage Management System — Frontend

React 18 + Vite UI for the Spring Boot API.

Local URL: `http://localhost:5173`

## Setup

```bash
copy .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL` (Vite only exposes `VITE_*` variables):

```
VITE_API_URL=http://localhost:8080/api
```

Production (Vercel / Netlify environment variable):

```
VITE_API_URL=https://your-backend.onrender.com/api
```

Do not commit `.env`. Rebuild after changing `VITE_API_URL` — it is baked in at build time.

## Deploy (Vercel)

1. Import this repository into Vercel.
2. Framework preset: Vite. Build command: `npm run build`. Output: `dist`.
3. Set `VITE_API_URL` to the public backend URL **including** `/api`.
4. After the frontend URL exists, add it to the backend `CORS_ORIGINS`.

`vercel.json` rewrites client-side routes (`/records`, `/reports`, …) to `index.html`.
