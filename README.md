# QuickLink — Full-stack URL Shortener

A responsive MERN URL shortener with unique short codes, optional custom aliases, click tracking, copy-to-clipboard, search, link deletion, and redirect handling.

## Tech stack
- **Frontend:** React, Vite, Lucide icons, responsive CSS
- **Backend:** Node.js, Express, REST API
- **Database:** MongoDB + Mongoose
- **Short codes:** `nanoid`

## Requirements
- Node.js 18+
- MongoDB local instance or a MongoDB Atlas connection string

## Run locally

### 1. Start the backend
```bash
cd server
npm install
```
Copy `.env.example` to `.env`, then set `MONGODB_URI` to your local MongoDB URI or Atlas connection string.

```bash
npm run dev
```
The API starts at `http://localhost:5000` after MongoDB connects.

### 2. Start the frontend
Open a second terminal:
```bash
cd client
npm install
```
Copy `.env.example` to `.env` if you want to configure the API URL.

```bash
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/urls` | List the 100 most recently created links |
| POST | `/api/urls` | Create a short URL; JSON: `{ "originalUrl": "https://example.com", "customAlias": "optional-name" }` |
| DELETE | `/api/urls/:id` | Delete a link by MongoDB document ID |
| GET | `/:shortCode` | Increment click count and redirect to the destination |

## Notes before deployment
This is a portfolio/demo starter. The dashboard endpoints are intentionally open for local development; add authentication, per-user ownership checks, rate limiting, abuse reporting, and production URL safety controls before exposing it publicly. Configure `CLIENT_URL` and `BASE_URL` for your deployed domains. `BASE_URL` is included as a configuration example for future API responses; the current client builds links from `VITE_API_URL`.
