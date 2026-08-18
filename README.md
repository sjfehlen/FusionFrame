# FusionFrame

A self-hosted app for planning a future home build or renovation — room-by-room smart-home tech
(presence, light, climate, automations, sound, security), non-tech finish decisions (paint,
flooring, appliances), whole-home infrastructure (networking, electrical, HVAC, plumbing, and
more), and a network line-drop estimator, all exposed over a self-documenting REST API so an AI
agent can research topics and write findings directly into the app.

## Running it

FusionFrame is a fully standalone Docker container — no external services required.

**Build from source:**

```bash
docker compose up --build
```

**Or pull the published image** (built and pushed to GHCR on every push to `main`):

```bash
docker compose -f docker-compose.prod.yml up -d
```

Then open `http://localhost:3000`.

## Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` with hot reload. The SQLite database lives under `./data` by
default (override with `DATA_DIR`).

## API

`GET /api` returns a self-documenting index of every endpoint. There is no authentication in
this version — do not expose the container to the public internet without putting a reverse
proxy or VPN in front of it yourself.

## Testing

```bash
npm test
```
