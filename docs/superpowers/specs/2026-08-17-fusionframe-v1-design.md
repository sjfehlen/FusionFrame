# FusionFrame v1 — Design Spec

**Date:** 2026-08-17
**Status:** Approved, pending implementation plan

## Purpose

FusionFrame is a self-hosted app for planning a future home build/renovation: room-by-room
smart-home tech (presence, light, climate, automations, sound, security), non-tech decisions
(paint, flooring, appliances, cabinets), and whole-home infrastructure (networking, electrical,
HVAC, plumbing, structured wiring, security, safety, exterior, energy) — organized so an AI
agent (Claude) can research topics and write structured findings directly into the app via a
REST API.

Full background and the broader feature vision (budget/Actual integration, purchases tracker,
project-management/kanban layer, open-source packaging, UI theming) live in the originating
idea doc: `ideas/home-planner-app.md` in the `home-infra-docs` repo. This spec covers **v1 only**
— the scope explicitly agreed during design: core CRUD for rooms and whole-home items, plus the
AI-facing REST API. Budget integration, purchases, the PM/kanban layer, auth/OIDC, and UI
theming polish are named-but-deferred, not forgotten — each gets its own follow-up spec when
picked up.

## Non-negotiable constraints

- **Fully standalone Docker container.** `docker run` with zero other services configured must
  produce a working app. No required external dependency (no Actual, no OIDC provider, no
  Cloudflare Access) for core functionality. Anything that talks to an external system (budget
  sync, SSO) must be an optional, unconfigured-by-default adapter.
- **No auth in v1.** Deliberately deferred — OIDC is planned for a later spec, but v1 ships with
  no auth layer at all. Because of this, the container is not safe to expose publicly without
  the operator putting something in front of it themselves (reverse proxy auth, VPN, etc.).
- **Open-source-ready from commit zero.** No secrets or personal data committed. License:
  MIT or Apache-2.0 (chosen at implementation time). Config over hardcoding wherever a fork
  would plausibly want to change it (categories, room types) — see Data Model.

## Architecture

Single SvelteKit (`adapter-node`) application backed by `better-sqlite3`, packaged as one Docker
image. No separate backend process or database container — mirrors the existing household
pattern used by `family-goals` (`/github/family-goals`), which runs the same way. SvelteKit
server routes (`+server.ts` under `src/routes/api/`) serve the external REST API; the app's own
UI consumes the same routes via `load` functions rather than a second internal API layer.

## Data model

Two modeling strategies, deliberately split by what each needs:

- **Strongly-typed relational tables** for anything computed over (physical attributes feeding
  the network line-drop estimate, purchases, research notes) — real columns, real `CHECK`
  constraints, plain SQL joins.
- **Config-driven tables** for anything a fork or future-you would want to edit without a code
  change (categories, room types and their defaults) — editable rows, not hardcoded enums.

```sql
-- Config: shared by rooms and whole-home items
categories (
  id, scope TEXT CHECK(scope IN ('room','whole_home')),
  key TEXT, label TEXT, sort_order INTEGER
)

room_types (
  id, key TEXT, label TEXT
)

room_type_defaults (            -- which categories a room type pre-populates
  room_type_id, category_id
)

room_type_checklist_defaults (  -- e.g. "range", "dishwasher" for Kitchen
  room_type_id, label TEXT
)

-- Core entities
rooms (
  id, name TEXT, room_type_id,
  sqft REAL, ceiling_height_in REAL, floor_level INTEGER,
  distance_from_closet_ft REAL, exterior_wall_count INTEGER,
  window_count INTEGER, window_type TEXT, compass_orientation TEXT,
  flooring_type TEXT, paint_color TEXT, accessibility_notes TEXT,
  created_at, updated_at
)

room_categories (                -- materialized at room-creation time from room_type_defaults
  id, room_id, category_id, notes TEXT
)

checklist_items (                -- materialized per room from room_type_checklist_defaults
  id, room_id, label TEXT,
  status TEXT CHECK(status IN ('considering','chosen','rejected')),
  notes TEXT, rejected_reason TEXT
)

network_endpoints (
  id, room_id, device_name TEXT, device_type TEXT, needs_poe INTEGER
)

whole_home_items (
  id, category_id, name TEXT, notes TEXT
)

purchases (
  id, item TEXT, vendor TEXT, price REAL, status TEXT, link TEXT,
  room_id INTEGER NULL, whole_home_item_id INTEGER NULL
  -- CHECK: exactly one of room_id / whole_home_item_id is set
)

research_notes (                 -- the AI-write target
  id, room_id NULL, whole_home_item_id NULL, category_id NULL,
  body TEXT, sources TEXT, created_at
)
```

**Template mechanics:** picking a room type at creation time copies (`INSERT`s) the matching
`room_type_defaults` rows into `room_categories` and `room_type_checklist_defaults` rows into
`checklist_items`. This is a one-time materialization, not a live lookup — editing a room type's
template later only affects rooms created after the edit. Every materialized row is then a
normal, independently editable/removable record; nothing about a room stays "locked" to its type
after creation.

**Deferred, not modeled in v1:** `phase` column/gating, `budget` tables (Actual adapter),
`tasks`/kanban tables. Schema leaves room for a `phase` column later but nothing in v1 reads or
enforces it.

## API surface

```
GET    /api                              -- self-documenting index (Family Goals pattern)

GET    /api/rooms
POST   /api/rooms                        -- { name, room_type_id, ...physical attributes }
GET    /api/rooms/:id
PATCH  /api/rooms/:id
DELETE /api/rooms/:id

GET    /api/whole-home-items
POST   /api/whole-home-items
GET    /api/whole-home-items/:id
PATCH  /api/whole-home-items/:id

GET    /api/categories                   -- ?scope=room|whole_home
GET    /api/room-types                   -- includes each type's defaults

POST   /api/rooms/:id/research           -- { category_id, body, sources }
POST   /api/whole-home-items/:id/research

GET    /api/purchases
POST   /api/purchases                    -- { item, vendor, price, link, room_id | whole_home_item_id }

GET    /api/rooms/:id/network-summary    -- computed: drop count, cable footage, >100m run flags
```

No auth middleware in v1 (see Non-negotiable constraints).

## UI structure

- Sidebar: Rooms / Whole-Home Items / Purchases.
- Room detail: physical-attributes form + category tabs (only materialized categories shown) +
  checklist.
- Whole-home item detail: same category-tab pattern, `scope='whole_home'`.
- No dashboard/rollup views in v1 — those depend on budget integration, which is deferred.

## Error handling

- Route handlers return `{ error: string }` JSON with standard HTTP status codes (400 validation,
  404 not found, 500 unexpected). No custom error framework.
- Data integrity rules (the `purchases` exactly-one-parent rule, category `scope` enum) enforced
  via SQLite `CHECK` constraints, not just app-level validation.
- No retry/circuit-breaker logic — single-user tool, local SQLite file, not a distributed system.

## Testing

- Vitest for route handlers and pure logic. The network-summary line-drop calculation (endpoint
  count + spare margin, cable-footage estimate, >100m run flag) is the one function that gets
  deliberate unit-test coverage — it's the one place a bug produces a silently wrong number.
- No e2e/browser suite in v1, matching the scale of `family-goals`; manual verification against
  the dev server is sufficient at this size.

## Explicitly deferred (own future spec each)

- Budget integration (pluggable adapter, Actual as the first backend via the `actual-budget` MCP
  server)
- Purchases-to-budget linkage
- Project-management / kanban layer, gated by the `phase` field
- OIDC authentication
- UI theming (Tailwind design tokens, shadcn-svelte component adoption) beyond whatever ships
  functionally in v1
- MCP server as a wrapper over this REST API
