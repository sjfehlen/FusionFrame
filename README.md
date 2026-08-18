# FusionFrame

A self-hosted app for planning a future home build or renovation — room-by-room smart-home tech
(presence, light, climate, automations, sound, security), non-tech finish decisions (paint,
flooring, appliances), whole-home infrastructure (networking, electrical, HVAC, plumbing, and
more), and a network line-drop estimator, all exposed over a self-documenting REST API so an AI
agent can research topics and write findings directly into the app.

## Status

**Beta.** v1 is implemented, tested, and running, but has known gaps: no read route for research
notes, no write path for network endpoints (so the line-drop estimator has no data to compute
against yet), no checklist status mutation, and no authentication of any kind. Expect breaking
schema changes before a stable 1.0.

## Why this exists

Built for planning an actual future home build with room-by-room smart-home decisions and
whole-home infrastructure tracked in one place, with an AI-writable interface so research findings
land directly in the app instead of a chat transcript. Existing renovation/PM tools (Cornerstone,
smart-home-planner, HomeBox, generic budget trackers) didn't cover both the smart-home planning
layer and general infrastructure/budget tracking together, so this is purpose-built instead.

## ⚠️ Built with agentic AI development

This project was built end-to-end by an AI coding agent (Claude), including the schema, API,
UI, and tests, under human direction and review rather than written by hand line-by-line. It has
been reviewed and tested, but you should treat it with the same caution you'd apply to any early
open-source project from an unfamiliar author — read the code before trusting it with real data,
and don't expose it to the public internet without your own security review. Use at your own risk.

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
