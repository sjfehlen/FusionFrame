# FusionFrame v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build v1 of FusionFrame — a standalone, self-hosted SvelteKit app for planning a
future home build/renovation, with room and whole-home-item CRUD, config-driven categories and
room-type templates, a network line-drop estimator, and a self-documenting REST API an AI agent
can write research findings and purchases into.

**Architecture:** Single SvelteKit (`adapter-node`) app backed by `better-sqlite3`, one Docker
image, no separate backend process. Server routes under `src/routes/api/` serve both the
external REST API and the app's own UI (via SvelteKit `load` functions calling the same
`$lib/server` modules — no second internal API layer). Two schema strategies side by side:
strongly-typed tables for anything computed over (rooms, network endpoints, purchases), and
config-driven tables for anything a fork should be able to edit without a code change
(categories, room types and their defaults).

**Tech Stack:** SvelteKit 2 + Svelte 5, `@sveltejs/adapter-node`, `better-sqlite3`, Vite, Vitest,
Node 24. Plain JavaScript (ESM), matching the household's existing `family-goals` app — no
TypeScript build step.

**Spec:** `docs/superpowers/specs/2026-08-17-fusionframe-v1-design.md`

## Global Constraints

- **Fully standalone Docker container.** `docker run` with zero other services configured must
  produce a working app. No required external dependency for core functionality.
- **No auth in v1.** No auth middleware, no token check, anywhere. OIDC is explicitly deferred.
- **No secrets or personal data committed.** `.env` stays gitignored; only `.env.example` is
  committed, with placeholder values.
- **Config over hardcoding** for categories and room types — they live in DB rows seeded from a
  plain JS config module, not as hardcoded enums baked into route logic.
- **Plain JavaScript (ESM), not TypeScript** — matches `family-goals` conventions.

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `svelte.config.js`
- Create: `vite.config.js`
- Create: `vitest.config.js`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app.html`
- Create: `src/app.css`
- Create: `src/routes/+layout.svelte` (minimal placeholder, replaced in Task 12)

**Interfaces:**
- Produces: a running `npm run dev` dev server on port 5173, and a `npm test` command wired to
  Vitest, for every later task to build on.

- [ ] **Step 1: Create `package.json`**

```json
{
	"name": "fusionframe",
	"version": "0.1.0",
	"private": true,
	"type": "module",
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"start": "node build/index.js",
		"test": "vitest run"
	},
	"dependencies": {
		"better-sqlite3": "^12.11.1"
	},
	"devDependencies": {
		"@sveltejs/adapter-node": "^5.2.12",
		"@sveltejs/kit": "^2.21.1",
		"@sveltejs/vite-plugin-svelte": "^5.0.3",
		"svelte": "^5.33.1",
		"vite": "^6.3.5",
		"vitest": "^3.0.0"
	}
}
```

- [ ] **Step 2: Create `svelte.config.js`**

```js
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

- [ ] **Step 3: Create `vite.config.js`**

```js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 5173
	}
});
```

- [ ] **Step 4: Create `vitest.config.js`**

```js
import { defineConfig } from 'vite';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.test.js']
	}
});
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
build/
.svelte-kit/
data/
.env
.env.*
!.env.example
vite.config.js.timestamp-*
```

- [ ] **Step 6: Create `.env.example`**

```
# Directory where the SQLite database file is stored
DATA_DIR=./data

# Public URL this app is served at (required by SvelteKit for CSRF origin checks
# once the app is deployed behind a real hostname)
ORIGIN=http://localhost:3000
```

- [ ] **Step 7: Create `src/app.html`**

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>FusionFrame</title>
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

- [ ] **Step 8: Create `src/app.css`**

```css
:root {
	color-scheme: light dark;
	--bg: #ffffff;
	--fg: #1a1a1a;
	--muted: #6b6b6b;
	--border: #e0e0e0;
	--accent: #2f6f4f;
}

@media (prefers-color-scheme: dark) {
	:root {
		--bg: #14161a;
		--fg: #e8e8e8;
		--muted: #9a9a9a;
		--border: #2c2f36;
	}
}

* {
	box-sizing: border-box;
}

body {
	margin: 0;
	background: var(--bg);
	color: var(--fg);
	font-family:
		system-ui,
		-apple-system,
		'Segoe UI',
		sans-serif;
}
```

- [ ] **Step 9: Create a placeholder `src/routes/+layout.svelte`**

```svelte
<script>
	import '../app.css';
	let { children } = $props();
</script>

{@render children()}
```

- [ ] **Step 10: Install dependencies and verify the dev server boots**

Run: `npm install && npm run dev -- --open=false &`
Expected: Vite prints `Local: http://localhost:5173/` with no errors. Stop the server
(`kill %1`) once confirmed.

- [ ] **Step 11: Verify Vitest runs with zero tests**

Run: `mkdir -p tests && npm test`
Expected: `No test files found` (not an error) — confirms Vitest is wired up before Task 2 adds
real tests.

- [ ] **Step 12: Commit**

```bash
git add package.json svelte.config.js vite.config.js vitest.config.js .gitignore .env.example src/app.html src/app.css src/routes/+layout.svelte package-lock.json
git commit -m "chore: scaffold SvelteKit project"
```

---

## Task 2: Database schema and seed config

**Files:**
- Create: `src/lib/server/db.js`
- Create: `src/lib/server/seed-data.js`
- Test: `tests/db.test.js`

**Interfaces:**
- Consumes: nothing (first data-layer module).
- Produces:
  - `db.js`: `export const db` (a `better-sqlite3` `Database` instance, schema already applied
    and seed data already inserted on import), `export const DATA_DIR`, `export function seed()`
    (re-runs the `INSERT OR IGNORE` seed statements — used directly by the idempotency test).
  - `seed-data.js`: `export const CATEGORIES` (array of `{ scope, key, label, sort_order }`),
    `export const ROOM_TYPES` (array of `{ key, label }`), `export const ROOM_TYPE_DEFAULTS`
    (array of `{ room_type_key, category_key }`), `export const ROOM_TYPE_CHECKLIST_DEFAULTS`
    (array of `{ room_type_key, label }`).

- [ ] **Step 1: Write `src/lib/server/seed-data.js`**

```js
export const CATEGORIES = [
	{ scope: 'room', key: 'presence', label: 'Presence', sort_order: 1 },
	{ scope: 'room', key: 'light', label: 'Light', sort_order: 2 },
	{ scope: 'room', key: 'climate', label: 'Climate', sort_order: 3 },
	{ scope: 'room', key: 'networking', label: 'Networking', sort_order: 4 },
	{ scope: 'room', key: 'automations', label: 'Automations', sort_order: 5 },
	{ scope: 'room', key: 'sound', label: 'Sound', sort_order: 6 },
	{ scope: 'room', key: 'security', label: 'Security', sort_order: 7 },
	{ scope: 'room', key: 'non_tech', label: 'Non-tech', sort_order: 8 },

	{ scope: 'whole_home', key: 'networking', label: 'Networking', sort_order: 1 },
	{ scope: 'whole_home', key: 'electrical', label: 'Electrical', sort_order: 2 },
	{ scope: 'whole_home', key: 'hvac', label: 'HVAC', sort_order: 3 },
	{ scope: 'whole_home', key: 'plumbing', label: 'Plumbing / water', sort_order: 4 },
	{ scope: 'whole_home', key: 'structured_wiring', label: 'Structured wiring / low-voltage', sort_order: 5 },
	{ scope: 'whole_home', key: 'security', label: 'Security', sort_order: 6 },
	{ scope: 'whole_home', key: 'safety', label: 'Safety', sort_order: 7 },
	{ scope: 'whole_home', key: 'exterior', label: 'Exterior', sort_order: 8 },
	{ scope: 'whole_home', key: 'energy', label: 'Energy', sort_order: 9 }
];

export const ROOM_TYPES = [
	{ key: 'kitchen', label: 'Kitchen' },
	{ key: 'bathroom', label: 'Bathroom' },
	{ key: 'bedroom', label: 'Bedroom' },
	{ key: 'primary_bedroom', label: 'Primary Bedroom' },
	{ key: 'living_room', label: 'Living Room' },
	{ key: 'home_office', label: 'Home Office' },
	{ key: 'garage', label: 'Garage' },
	{ key: 'mechanical', label: 'Mechanical / Utility' },
	{ key: 'other', label: 'Other' }
];

// scope for every default below is always 'room' — room types only ever pre-populate room-scoped categories
export const ROOM_TYPE_DEFAULTS = [
	{ room_type_key: 'kitchen', category_key: 'non_tech' },
	{ room_type_key: 'kitchen', category_key: 'electrical' },
	{ room_type_key: 'kitchen', category_key: 'networking' },

	{ room_type_key: 'bathroom', category_key: 'non_tech' },
	{ room_type_key: 'bathroom', category_key: 'climate' },

	{ room_type_key: 'bedroom', category_key: 'presence' },
	{ room_type_key: 'bedroom', category_key: 'security' },
	{ room_type_key: 'bedroom', category_key: 'non_tech' },

	{ room_type_key: 'primary_bedroom', category_key: 'presence' },
	{ room_type_key: 'primary_bedroom', category_key: 'security' },
	{ room_type_key: 'primary_bedroom', category_key: 'non_tech' },

	{ room_type_key: 'living_room', category_key: 'sound' },
	{ room_type_key: 'living_room', category_key: 'networking' },
	{ room_type_key: 'living_room', category_key: 'light' },

	{ room_type_key: 'home_office', category_key: 'networking' },

	{ room_type_key: 'garage', category_key: 'security' },
	{ room_type_key: 'garage', category_key: 'climate' },
	{ room_type_key: 'garage', category_key: 'electrical' }
];

export const ROOM_TYPE_CHECKLIST_DEFAULTS = [
	{ room_type_key: 'kitchen', label: 'Range/oven' },
	{ room_type_key: 'kitchen', label: 'Refrigerator' },
	{ room_type_key: 'kitchen', label: 'Dishwasher' },
	{ room_type_key: 'kitchen', label: 'Vent hood' },
	{ room_type_key: 'kitchen', label: 'Garbage disposal' },
	{ room_type_key: 'kitchen', label: 'Sink' },

	{ room_type_key: 'bathroom', label: 'Vanity' },
	{ room_type_key: 'bathroom', label: 'Tub/shower' },
	{ room_type_key: 'bathroom', label: 'Toilet' },

	{ room_type_key: 'bedroom', label: 'Closet' },

	{ room_type_key: 'primary_bedroom', label: 'Walk-in closet' },
	{ room_type_key: 'primary_bedroom', label: 'Ensuite bath' },

	{ room_type_key: 'garage', label: 'EV charger circuit' }
];
```

- [ ] **Step 2: Write `src/lib/server/db.js`**

```js
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { CATEGORIES, ROOM_TYPES, ROOM_TYPE_DEFAULTS, ROOM_TYPE_CHECKLIST_DEFAULTS } from './seed-data.js';

export const DATA_DIR = process.env.DATA_DIR || './data';
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'app.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	scope TEXT NOT NULL CHECK (scope IN ('room', 'whole_home')),
	key TEXT NOT NULL,
	label TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	UNIQUE (scope, key)
);

CREATE TABLE IF NOT EXISTS room_types (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	key TEXT NOT NULL UNIQUE,
	label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS room_type_defaults (
	room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
	category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
	PRIMARY KEY (room_type_id, category_id)
);

CREATE TABLE IF NOT EXISTS room_type_checklist_defaults (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
	label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	room_type_id INTEGER REFERENCES room_types(id),
	sqft REAL,
	ceiling_height_in REAL,
	floor_level INTEGER,
	distance_from_closet_ft REAL,
	exterior_wall_count INTEGER,
	window_count INTEGER,
	window_type TEXT,
	compass_orientation TEXT,
	flooring_type TEXT,
	paint_color TEXT,
	accessibility_notes TEXT,
	created_at TEXT DEFAULT (datetime('now')),
	updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS room_categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
	category_id INTEGER NOT NULL REFERENCES categories(id),
	notes TEXT DEFAULT '',
	UNIQUE (room_id, category_id)
);

CREATE TABLE IF NOT EXISTS checklist_items (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
	label TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'considering' CHECK (status IN ('considering', 'chosen', 'rejected')),
	notes TEXT DEFAULT '',
	rejected_reason TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS network_endpoints (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
	device_name TEXT NOT NULL,
	device_type TEXT NOT NULL DEFAULT 'other',
	needs_poe INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS whole_home_items (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	category_id INTEGER NOT NULL REFERENCES categories(id),
	name TEXT NOT NULL,
	notes TEXT DEFAULT '',
	created_at TEXT DEFAULT (datetime('now')),
	updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchases (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	item TEXT NOT NULL,
	vendor TEXT DEFAULT '',
	price REAL,
	status TEXT NOT NULL DEFAULT 'researching' CHECK (status IN ('researching', 'considering', 'purchased', 'installed')),
	link TEXT DEFAULT '',
	room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
	whole_home_item_id INTEGER REFERENCES whole_home_items(id) ON DELETE CASCADE,
	created_at TEXT DEFAULT (datetime('now')),
	CHECK (
		(room_id IS NOT NULL AND whole_home_item_id IS NULL) OR
		(room_id IS NULL AND whole_home_item_id IS NOT NULL)
	)
);

CREATE TABLE IF NOT EXISTS research_notes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
	whole_home_item_id INTEGER REFERENCES whole_home_items(id) ON DELETE CASCADE,
	category_id INTEGER REFERENCES categories(id),
	body TEXT NOT NULL,
	sources TEXT DEFAULT '',
	created_at TEXT DEFAULT (datetime('now')),
	CHECK (
		(room_id IS NOT NULL AND whole_home_item_id IS NULL) OR
		(room_id IS NULL AND whole_home_item_id IS NOT NULL)
	)
);
`);

export function seed() {
	const insertCategory = db.prepare(
		'INSERT OR IGNORE INTO categories (scope, key, label, sort_order) VALUES (?, ?, ?, ?)'
	);
	for (const c of CATEGORIES) insertCategory.run(c.scope, c.key, c.label, c.sort_order);

	const insertRoomType = db.prepare('INSERT OR IGNORE INTO room_types (key, label) VALUES (?, ?)');
	for (const rt of ROOM_TYPES) insertRoomType.run(rt.key, rt.label);

	const getCategoryId = db.prepare('SELECT id FROM categories WHERE scope = ? AND key = ?');
	const getRoomTypeId = db.prepare('SELECT id FROM room_types WHERE key = ?');

	const insertDefault = db.prepare(
		'INSERT OR IGNORE INTO room_type_defaults (room_type_id, category_id) VALUES (?, ?)'
	);
	for (const d of ROOM_TYPE_DEFAULTS) {
		const roomType = getRoomTypeId.get(d.room_type_key);
		const category = getCategoryId.get('room', d.category_key);
		if (roomType && category) insertDefault.run(roomType.id, category.id);
	}

	const checklistExists = db.prepare(
		'SELECT 1 FROM room_type_checklist_defaults WHERE room_type_id = ? AND label = ?'
	);
	const insertChecklistDefault = db.prepare(
		'INSERT INTO room_type_checklist_defaults (room_type_id, label) VALUES (?, ?)'
	);
	for (const c of ROOM_TYPE_CHECKLIST_DEFAULTS) {
		const roomType = getRoomTypeId.get(c.room_type_key);
		if (!roomType) continue;
		if (!checklistExists.get(roomType.id, c.label)) {
			insertChecklistDefault.run(roomType.id, c.label);
		}
	}
}

seed();
```

- [ ] **Step 3: Write `tests/db.test.js`**

```js
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('db schema and seed', () => {
	let db;

	beforeAll(async () => {
		process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionframe-test-'));
		({ db } = await import('../src/lib/server/db.js'));
	});

	it('seeds room-scoped and whole-home-scoped categories', () => {
		const roomCount = db.prepare("SELECT COUNT(*) AS n FROM categories WHERE scope = 'room'").get().n;
		const wholeHomeCount = db.prepare("SELECT COUNT(*) AS n FROM categories WHERE scope = 'whole_home'").get().n;
		expect(roomCount).toBe(8);
		expect(wholeHomeCount).toBe(9);
	});

	it('seeds room types including kitchen', () => {
		const kitchen = db.prepare('SELECT * FROM room_types WHERE key = ?').get('kitchen');
		expect(kitchen).toBeTruthy();
		expect(kitchen.label).toBe('Kitchen');
	});

	it('links kitchen to its default categories', () => {
		const rows = db
			.prepare(
				`SELECT c.key FROM room_type_defaults rtd
				 JOIN room_types rt ON rt.id = rtd.room_type_id
				 JOIN categories c ON c.id = rtd.category_id
				 WHERE rt.key = 'kitchen'`
			)
			.all()
			.map((r) => r.key);
		expect(rows.sort()).toEqual(['electrical', 'networking', 'non_tech']);
	});

	it('is idempotent — re-running the seed INSERT OR IGNORE statements does not duplicate rows', async () => {
		const before = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
		const { seed } = await import('../src/lib/server/db.js');
		seed();
		const after = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
		expect(after).toBe(before);
	});
});
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test -- tests/db.test.js`
Expected: all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/db.js src/lib/server/seed-data.js tests/db.test.js
git commit -m "feat: database schema and config-driven category/room-type seed data"
```

---

## Task 3: Room creation with room-type template materialization

**Files:**
- Create: `src/lib/server/rooms.js`
- Test: `tests/rooms.test.js`

**Interfaces:**
- Consumes: `db` from `$lib/server/db.js`.
- Produces:
  - `createRoom(fields)` → inserts a room and materializes its room type's default categories
    and checklist items; returns the full room object (see `getRoom`).
  - `listRooms()` → array of rooms with `room_type_label` joined in.
  - `getRoom(id)` → `{ ...room, categories: [...], checklist: [...] }` or `null`.
  - `updateRoom(id, fields)` → updates allowed columns, returns updated room via `getRoom`.
  - `deleteRoom(id)` → deletes the room (cascades to categories/checklist/endpoints via FK).

- [ ] **Step 1: Write the failing test for `createRoom` materialization**

```js
// tests/rooms.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('rooms', () => {
	let db, createRoom, getRoom, listRooms, updateRoom, deleteRoom;

	beforeAll(async () => {
		process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionframe-test-'));
		({ db } = await import('../src/lib/server/db.js'));
		({ createRoom, getRoom, listRooms, updateRoom, deleteRoom } = await import('../src/lib/server/rooms.js'));
	});

	it('materializes the kitchen room type\'s default categories and checklist on creation', () => {
		const kitchenTypeId = db.prepare("SELECT id FROM room_types WHERE key = 'kitchen'").get().id;
		const room = createRoom({ name: 'Main Kitchen', room_type_id: kitchenTypeId, sqft: 220 });

		expect(room.name).toBe('Main Kitchen');
		expect(room.categories.map((c) => c.key).sort()).toEqual(['electrical', 'networking', 'non_tech']);
		expect(room.checklist.map((c) => c.label).sort()).toEqual(
			['Dishwasher', 'Garbage disposal', 'Range/oven', 'Refrigerator', 'Sink', 'Vent hood'].sort()
		);
		expect(room.checklist.every((c) => c.status === 'considering')).toBe(true);
	});

	it('creates a room with no room type and no materialized defaults', () => {
		const room = createRoom({ name: 'Mystery Room' });
		expect(room.categories).toEqual([]);
		expect(room.checklist).toEqual([]);
	});

	it('listRooms returns every created room with its room type label', () => {
		const rooms = listRooms();
		expect(rooms.some((r) => r.name === 'Main Kitchen' && r.room_type_label === 'Kitchen')).toBe(true);
	});

	it('updateRoom updates physical attributes without touching categories/checklist', () => {
		const room = createRoom({ name: 'Office' });
		const updated = updateRoom(room.id, { sqft: 150, paint_color: 'Sage Green' });
		expect(updated.sqft).toBe(150);
		expect(updated.paint_color).toBe('Sage Green');
	});

	it('deleteRoom removes the room and its materialized categories/checklist', () => {
		const kitchenTypeId = db.prepare("SELECT id FROM room_types WHERE key = 'kitchen'").get().id;
		const room = createRoom({ name: 'Temp Kitchen', room_type_id: kitchenTypeId });
		deleteRoom(room.id);
		expect(getRoom(room.id)).toBeNull();
		const orphanedChecklist = db.prepare('SELECT COUNT(*) AS n FROM checklist_items WHERE room_id = ?').get(room.id).n;
		expect(orphanedChecklist).toBe(0);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/rooms.test.js`
Expected: FAIL — `Cannot find module '../src/lib/server/rooms.js'`

- [ ] **Step 3: Write `src/lib/server/rooms.js`**

```js
import { db } from './db.js';

const ROOM_COLUMNS = [
	'name',
	'room_type_id',
	'sqft',
	'ceiling_height_in',
	'floor_level',
	'distance_from_closet_ft',
	'exterior_wall_count',
	'window_count',
	'window_type',
	'compass_orientation',
	'flooring_type',
	'paint_color',
	'accessibility_notes'
];

export function createRoom(fields) {
	const columns = ROOM_COLUMNS.filter((c) => fields[c] !== undefined);
	const placeholders = columns.map(() => '?').join(', ');
	const values = columns.map((c) => fields[c]);

	const { lastInsertRowid } = db
		.prepare(`INSERT INTO rooms (${columns.join(', ')}) VALUES (${placeholders})`)
		.run(...values);

	if (fields.room_type_id) {
		materializeRoomType(lastInsertRowid, fields.room_type_id);
	}

	return getRoom(lastInsertRowid);
}

function materializeRoomType(roomId, roomTypeId) {
	const defaultCategories = db
		.prepare('SELECT category_id FROM room_type_defaults WHERE room_type_id = ?')
		.all(roomTypeId);
	const insertCategory = db.prepare(
		'INSERT INTO room_categories (room_id, category_id) VALUES (?, ?)'
	);
	for (const { category_id } of defaultCategories) {
		insertCategory.run(roomId, category_id);
	}

	const defaultChecklist = db
		.prepare('SELECT label FROM room_type_checklist_defaults WHERE room_type_id = ?')
		.all(roomTypeId);
	const insertChecklist = db.prepare(
		'INSERT INTO checklist_items (room_id, label) VALUES (?, ?)'
	);
	for (const { label } of defaultChecklist) {
		insertChecklist.run(roomId, label);
	}
}

export function listRooms() {
	return db
		.prepare(
			`SELECT rooms.*, room_types.label AS room_type_label
			 FROM rooms
			 LEFT JOIN room_types ON room_types.id = rooms.room_type_id
			 ORDER BY rooms.name`
		)
		.all();
}

export function getRoom(id) {
	const room = db
		.prepare(
			`SELECT rooms.*, room_types.label AS room_type_label
			 FROM rooms
			 LEFT JOIN room_types ON room_types.id = rooms.room_type_id
			 WHERE rooms.id = ?`
		)
		.get(id);
	if (!room) return null;

	const categories = db
		.prepare(
			`SELECT room_categories.id AS room_category_id, categories.id, categories.key, categories.label, room_categories.notes
			 FROM room_categories
			 JOIN categories ON categories.id = room_categories.category_id
			 WHERE room_categories.room_id = ?
			 ORDER BY categories.sort_order`
		)
		.all(id);

	const checklist = db
		.prepare('SELECT * FROM checklist_items WHERE room_id = ? ORDER BY id')
		.all(id);

	const networkEndpoints = db
		.prepare('SELECT * FROM network_endpoints WHERE room_id = ? ORDER BY id')
		.all(id);

	return { ...room, categories, checklist, network_endpoints: networkEndpoints };
}

export function updateRoom(id, fields) {
	const columns = ROOM_COLUMNS.filter((c) => fields[c] !== undefined);
	if (columns.length === 0) return getRoom(id);

	const assignments = columns.map((c) => `${c} = ?`).join(', ');
	const values = columns.map((c) => fields[c]);
	db.prepare(`UPDATE rooms SET ${assignments}, updated_at = datetime('now') WHERE id = ?`).run(
		...values,
		id
	);

	return getRoom(id);
}

export function deleteRoom(id) {
	db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test -- tests/rooms.test.js`
Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/rooms.js tests/rooms.test.js
git commit -m "feat: room CRUD with room-type template materialization"
```

---

## Task 4: Network line-drop calculation

**Files:**
- Create: `src/lib/server/networkSummary.js`
- Test: `tests/networkSummary.test.js`

**Interfaces:**
- Consumes: nothing (pure function, no DB).
- Produces: `computeNetworkSummary({ endpointCount, distanceFromClosetFt, spareMargin })` →
  `{ dropCount, estimatedCableFootage, runLimitFt, exceedsRunLimit }`. This is the function
  Task 10's API route wraps with real DB reads.

- [ ] **Step 1: Write the failing tests**

```js
// tests/networkSummary.test.js
import { describe, it, expect } from 'vitest';
import { computeNetworkSummary } from '../src/lib/server/networkSummary.js';

describe('computeNetworkSummary', () => {
	it('adds the default spare margin of 1 to the endpoint count', () => {
		const result = computeNetworkSummary({ endpointCount: 3, distanceFromClosetFt: 40 });
		expect(result.dropCount).toBe(4);
	});

	it('respects a custom spare margin', () => {
		const result = computeNetworkSummary({ endpointCount: 3, distanceFromClosetFt: 40, spareMargin: 2 });
		expect(result.dropCount).toBe(5);
	});

	it('estimates total cable footage as dropCount * distance', () => {
		const result = computeNetworkSummary({ endpointCount: 3, distanceFromClosetFt: 40 });
		expect(result.estimatedCableFootage).toBe(4 * 40);
	});

	it('flags runs that exceed the 328ft (100m) practical Ethernet limit', () => {
		const short = computeNetworkSummary({ endpointCount: 1, distanceFromClosetFt: 100 });
		const long = computeNetworkSummary({ endpointCount: 1, distanceFromClosetFt: 400 });
		expect(short.exceedsRunLimit).toBe(false);
		expect(long.exceedsRunLimit).toBe(true);
		expect(long.runLimitFt).toBe(328);
	});

	it('treats a missing distance as unknown — no footage estimate, no limit flag', () => {
		const result = computeNetworkSummary({ endpointCount: 2 });
		expect(result.dropCount).toBe(3);
		expect(result.estimatedCableFootage).toBeNull();
		expect(result.exceedsRunLimit).toBeNull();
	});

	it('returns a zero drop count for a room with no endpoints and no spare margin override', () => {
		const result = computeNetworkSummary({ endpointCount: 0, distanceFromClosetFt: 20, spareMargin: 0 });
		expect(result.dropCount).toBe(0);
		expect(result.estimatedCableFootage).toBe(0);
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/networkSummary.test.js`
Expected: FAIL — `Cannot find module '../src/lib/server/networkSummary.js'`

- [ ] **Step 3: Write `src/lib/server/networkSummary.js`**

```js
const RUN_LIMIT_FT = 328; // ~100m practical Ethernet run limit before repeaters/media converters are needed

export function computeNetworkSummary({ endpointCount, distanceFromClosetFt, spareMargin = 1 }) {
	const dropCount = endpointCount + spareMargin;

	const hasDistance = distanceFromClosetFt !== undefined && distanceFromClosetFt !== null;

	return {
		dropCount,
		estimatedCableFootage: hasDistance ? dropCount * distanceFromClosetFt : null,
		runLimitFt: RUN_LIMIT_FT,
		exceedsRunLimit: hasDistance ? distanceFromClosetFt > RUN_LIMIT_FT : null
	};
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test -- tests/networkSummary.test.js`
Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/networkSummary.js tests/networkSummary.test.js
git commit -m "feat: network line-drop estimation calculation"
```

---

## Task 5: Whole-home items CRUD

**Files:**
- Create: `src/lib/server/wholeHomeItems.js`
- Test: `tests/wholeHomeItems.test.js`

**Interfaces:**
- Consumes: `db` from `$lib/server/db.js`.
- Produces: `createWholeHomeItem({ category_id, name, notes })`, `listWholeHomeItems()`,
  `getWholeHomeItem(id)`, `updateWholeHomeItem(id, fields)`, `deleteWholeHomeItem(id)`.

- [ ] **Step 1: Write the failing test**

```js
// tests/wholeHomeItems.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('whole-home items', () => {
	let db, createWholeHomeItem, listWholeHomeItems, getWholeHomeItem, updateWholeHomeItem, deleteWholeHomeItem;

	beforeAll(async () => {
		process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionframe-test-'));
		({ db } = await import('../src/lib/server/db.js'));
		({ createWholeHomeItem, listWholeHomeItems, getWholeHomeItem, updateWholeHomeItem, deleteWholeHomeItem } =
			await import('../src/lib/server/wholeHomeItems.js'));
	});

	function networkingCategoryId() {
		return db.prepare("SELECT id FROM categories WHERE scope = 'whole_home' AND key = 'networking'").get().id;
	}

	it('creates a whole-home item under a whole_home-scoped category', () => {
		const item = createWholeHomeItem({
			category_id: networkingCategoryId(),
			name: 'Main wiring closet',
			notes: 'Utility room, north wall'
		});
		expect(item.name).toBe('Main wiring closet');
		expect(item.category_label).toBe('Networking');
	});

	it('lists all whole-home items with category label joined in', () => {
		const items = listWholeHomeItems();
		expect(items.some((i) => i.name === 'Main wiring closet')).toBe(true);
	});

	it('gets a single item by id', () => {
		const created = createWholeHomeItem({ category_id: networkingCategoryId(), name: 'Rack' });
		const fetched = getWholeHomeItem(created.id);
		expect(fetched.name).toBe('Rack');
	});

	it('returns null for a missing item', () => {
		expect(getWholeHomeItem(999999)).toBeNull();
	});

	it('updates notes without changing the name', () => {
		const created = createWholeHomeItem({ category_id: networkingCategoryId(), name: 'Panel' });
		const updated = updateWholeHomeItem(created.id, { notes: '200A service' });
		expect(updated.name).toBe('Panel');
		expect(updated.notes).toBe('200A service');
	});

	it('deletes an item', () => {
		const created = createWholeHomeItem({ category_id: networkingCategoryId(), name: 'Temp' });
		deleteWholeHomeItem(created.id);
		expect(getWholeHomeItem(created.id)).toBeNull();
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/wholeHomeItems.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/server/wholeHomeItems.js`**

```js
import { db } from './db.js';

export function createWholeHomeItem({ category_id, name, notes = '' }) {
	const { lastInsertRowid } = db
		.prepare('INSERT INTO whole_home_items (category_id, name, notes) VALUES (?, ?, ?)')
		.run(category_id, name, notes);
	return getWholeHomeItem(lastInsertRowid);
}

export function listWholeHomeItems() {
	return db
		.prepare(
			`SELECT whole_home_items.*, categories.label AS category_label, categories.key AS category_key
			 FROM whole_home_items
			 JOIN categories ON categories.id = whole_home_items.category_id
			 ORDER BY categories.sort_order, whole_home_items.name`
		)
		.all();
}

export function getWholeHomeItem(id) {
	return (
		db
			.prepare(
				`SELECT whole_home_items.*, categories.label AS category_label, categories.key AS category_key
				 FROM whole_home_items
				 JOIN categories ON categories.id = whole_home_items.category_id
				 WHERE whole_home_items.id = ?`
			)
			.get(id) ?? null
	);
}

export function updateWholeHomeItem(id, fields) {
	const columns = ['category_id', 'name', 'notes'].filter((c) => fields[c] !== undefined);
	if (columns.length === 0) return getWholeHomeItem(id);

	const assignments = columns.map((c) => `${c} = ?`).join(', ');
	const values = columns.map((c) => fields[c]);
	db.prepare(
		`UPDATE whole_home_items SET ${assignments}, updated_at = datetime('now') WHERE id = ?`
	).run(...values, id);

	return getWholeHomeItem(id);
}

export function deleteWholeHomeItem(id) {
	db.prepare('DELETE FROM whole_home_items WHERE id = ?').run(id);
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test -- tests/wholeHomeItems.test.js`
Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/wholeHomeItems.js tests/wholeHomeItems.test.js
git commit -m "feat: whole-home item CRUD"
```

---

## Task 6: Purchases and research notes

**Files:**
- Create: `src/lib/server/purchases.js`
- Create: `src/lib/server/research.js`
- Test: `tests/purchases.test.js`
- Test: `tests/research.test.js`

**Interfaces:**
- Consumes: `db` from `$lib/server/db.js`.
- Produces:
  - `purchases.js`: `createPurchase(fields)` (throws if neither/both of `room_id` /
    `whole_home_item_id` are set), `listPurchases()`.
  - `research.js`: `createResearchNote(fields)` (same one-parent rule), `listResearchNotes({ room_id, whole_home_item_id })`.

- [ ] **Step 1: Write the failing test for purchases**

```js
// tests/purchases.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('purchases', () => {
	let createPurchase, listPurchases, createRoom;

	beforeAll(async () => {
		process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionframe-test-'));
		await import('../src/lib/server/db.js');
		({ createRoom } = await import('../src/lib/server/rooms.js'));
		({ createPurchase, listPurchases } = await import('../src/lib/server/purchases.js'));
	});

	it('creates a purchase linked to a room', () => {
		const room = createRoom({ name: 'Kitchen' });
		const purchase = createPurchase({
			item: 'Induction range',
			vendor: 'GE',
			price: 1899,
			status: 'considering',
			room_id: room.id
		});
		expect(purchase.item).toBe('Induction range');
		expect(purchase.room_id).toBe(room.id);
	});

	it('rejects a purchase with neither room_id nor whole_home_item_id', () => {
		expect(() => createPurchase({ item: 'Mystery item' })).toThrow();
	});

	it('rejects a purchase with both room_id and whole_home_item_id', () => {
		const room = createRoom({ name: 'Office' });
		expect(() => createPurchase({ item: 'Bad', room_id: room.id, whole_home_item_id: 1 })).toThrow();
	});

	it('lists purchases in creation order', () => {
		const purchases = listPurchases();
		expect(purchases.length).toBeGreaterThanOrEqual(1);
	});
});
```

- [ ] **Step 2: Write the failing test for research notes**

```js
// tests/research.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('research notes', () => {
	let createResearchNote, listResearchNotes, createRoom;

	beforeAll(async () => {
		process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionframe-test-'));
		await import('../src/lib/server/db.js');
		({ createRoom } = await import('../src/lib/server/rooms.js'));
		({ createResearchNote, listResearchNotes } = await import('../src/lib/server/research.js'));
	});

	it('creates a research note attached to a room', () => {
		const room = createRoom({ name: 'Living Room' });
		const note = createResearchNote({
			room_id: room.id,
			body: 'Best in-ceiling speaker for a 12x14 room: Klipsch CDT-5650-C II',
			sources: 'https://example.com/review'
		});
		expect(note.room_id).toBe(room.id);
		expect(note.body).toContain('Klipsch');
	});

	it('rejects a note with neither room_id nor whole_home_item_id', () => {
		expect(() => createResearchNote({ body: 'orphan note' })).toThrow();
	});

	it('lists notes filtered by room_id', () => {
		const room = createRoom({ name: 'Bedroom' });
		createResearchNote({ room_id: room.id, body: 'note one' });
		createResearchNote({ room_id: room.id, body: 'note two' });
		const notes = listResearchNotes({ room_id: room.id });
		expect(notes).toHaveLength(2);
	});
});
```

- [ ] **Step 3: Run both test files to verify they fail**

Run: `npm test -- tests/purchases.test.js tests/research.test.js`
Expected: FAIL — modules not found.

- [ ] **Step 4: Write `src/lib/server/purchases.js`**

```js
import { db } from './db.js';

export function createPurchase({ item, vendor = '', price = null, status = 'researching', link = '', room_id = null, whole_home_item_id = null }) {
	const hasRoom = room_id !== null && room_id !== undefined;
	const hasWholeHome = whole_home_item_id !== null && whole_home_item_id !== undefined;
	if (hasRoom === hasWholeHome) {
		throw new Error('A purchase must be linked to exactly one of room_id or whole_home_item_id');
	}

	const { lastInsertRowid } = db
		.prepare(
			`INSERT INTO purchases (item, vendor, price, status, link, room_id, whole_home_item_id)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		)
		.run(item, vendor, price, status, link, room_id, whole_home_item_id);

	return db.prepare('SELECT * FROM purchases WHERE id = ?').get(lastInsertRowid);
}

export function listPurchases() {
	return db.prepare('SELECT * FROM purchases ORDER BY created_at DESC, id DESC').all();
}
```

- [ ] **Step 5: Write `src/lib/server/research.js`**

```js
import { db } from './db.js';

export function createResearchNote({ room_id = null, whole_home_item_id = null, category_id = null, body, sources = '' }) {
	const hasRoom = room_id !== null && room_id !== undefined;
	const hasWholeHome = whole_home_item_id !== null && whole_home_item_id !== undefined;
	if (hasRoom === hasWholeHome) {
		throw new Error('A research note must be linked to exactly one of room_id or whole_home_item_id');
	}

	const { lastInsertRowid } = db
		.prepare(
			`INSERT INTO research_notes (room_id, whole_home_item_id, category_id, body, sources)
			 VALUES (?, ?, ?, ?, ?)`
		)
		.run(room_id, whole_home_item_id, category_id, body, sources);

	return db.prepare('SELECT * FROM research_notes WHERE id = ?').get(lastInsertRowid);
}

export function listResearchNotes({ room_id = null, whole_home_item_id = null } = {}) {
	if (room_id) {
		return db
			.prepare('SELECT * FROM research_notes WHERE room_id = ? ORDER BY created_at DESC')
			.all(room_id);
	}
	if (whole_home_item_id) {
		return db
			.prepare('SELECT * FROM research_notes WHERE whole_home_item_id = ? ORDER BY created_at DESC')
			.all(whole_home_item_id);
	}
	return db.prepare('SELECT * FROM research_notes ORDER BY created_at DESC').all();
}
```

- [ ] **Step 6: Run the tests and verify they pass**

Run: `npm test -- tests/purchases.test.js tests/research.test.js`
Expected: all 7 tests pass (4 + 3).

- [ ] **Step 7: Commit**

```bash
git add src/lib/server/purchases.js src/lib/server/research.js tests/purchases.test.js tests/research.test.js
git commit -m "feat: purchases and research notes with single-parent constraint"
```

---

## Task 7: REST API routes — rooms, whole-home items, categories, room types

**Files:**
- Create: `src/routes/api/rooms/+server.js`
- Create: `src/routes/api/rooms/[id]/+server.js`
- Create: `src/routes/api/whole-home-items/+server.js`
- Create: `src/routes/api/whole-home-items/[id]/+server.js`
- Create: `src/routes/api/categories/+server.js`
- Create: `src/routes/api/room-types/+server.js`

**Interfaces:**
- Consumes: `createRoom`, `listRooms`, `getRoom`, `updateRoom`, `deleteRoom` from
  `$lib/server/rooms.js`; `createWholeHomeItem`, `listWholeHomeItems`, `getWholeHomeItem`,
  `updateWholeHomeItem` from `$lib/server/wholeHomeItems.js`; `db` from `$lib/server/db.js`.
- Produces: the room and whole-home-item HTTP surface every later UI task and the AI agent call
  against.

- [ ] **Step 1: Write `src/routes/api/rooms/+server.js`**

```js
import { json } from '@sveltejs/kit';
import { createRoom, listRooms } from '$lib/server/rooms.js';

export function GET() {
	return json({ rooms: listRooms() });
}

export async function POST({ request }) {
	const fields = await request.json();
	if (!fields.name) {
		return json({ error: 'name is required' }, { status: 400 });
	}
	const room = createRoom(fields);
	return json({ room }, { status: 201 });
}
```

- [ ] **Step 2: Write `src/routes/api/rooms/[id]/+server.js`**

```js
import { json } from '@sveltejs/kit';
import { getRoom, updateRoom, deleteRoom } from '$lib/server/rooms.js';

export function GET({ params }) {
	const room = getRoom(params.id);
	if (!room) return json({ error: 'room not found' }, { status: 404 });
	return json({ room });
}

export async function PATCH({ params, request }) {
	const existing = getRoom(params.id);
	if (!existing) return json({ error: 'room not found' }, { status: 404 });
	const fields = await request.json();
	const room = updateRoom(params.id, fields);
	return json({ room });
}

export function DELETE({ params }) {
	const existing = getRoom(params.id);
	if (!existing) return json({ error: 'room not found' }, { status: 404 });
	deleteRoom(params.id);
	return json({ ok: true });
}
```

- [ ] **Step 3: Write `src/routes/api/whole-home-items/+server.js`**

```js
import { json } from '@sveltejs/kit';
import { createWholeHomeItem, listWholeHomeItems } from '$lib/server/wholeHomeItems.js';

export function GET() {
	return json({ whole_home_items: listWholeHomeItems() });
}

export async function POST({ request }) {
	const fields = await request.json();
	if (!fields.name || !fields.category_id) {
		return json({ error: 'name and category_id are required' }, { status: 400 });
	}
	const item = createWholeHomeItem(fields);
	return json({ whole_home_item: item }, { status: 201 });
}
```

- [ ] **Step 4: Write `src/routes/api/whole-home-items/[id]/+server.js`**

```js
import { json } from '@sveltejs/kit';
import { getWholeHomeItem, updateWholeHomeItem } from '$lib/server/wholeHomeItems.js';

export function GET({ params }) {
	const item = getWholeHomeItem(params.id);
	if (!item) return json({ error: 'whole-home item not found' }, { status: 404 });
	return json({ whole_home_item: item });
}

export async function PATCH({ params, request }) {
	const existing = getWholeHomeItem(params.id);
	if (!existing) return json({ error: 'whole-home item not found' }, { status: 404 });
	const fields = await request.json();
	const item = updateWholeHomeItem(params.id, fields);
	return json({ whole_home_item: item });
}
```

- [ ] **Step 5: Write `src/routes/api/categories/+server.js`**

```js
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';

export function GET({ url }) {
	const scope = url.searchParams.get('scope');
	const categories = scope
		? db.prepare('SELECT * FROM categories WHERE scope = ? ORDER BY sort_order').all(scope)
		: db.prepare('SELECT * FROM categories ORDER BY scope, sort_order').all();
	return json({ categories });
}
```

- [ ] **Step 6: Write `src/routes/api/room-types/+server.js`**

```js
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';

export function GET() {
	const roomTypes = db.prepare('SELECT * FROM room_types ORDER BY label').all();
	const defaults = db
		.prepare(
			`SELECT room_type_defaults.room_type_id, categories.key AS category_key, categories.label AS category_label
			 FROM room_type_defaults
			 JOIN categories ON categories.id = room_type_defaults.category_id`
		)
		.all();
	const checklistDefaults = db
		.prepare('SELECT room_type_id, label FROM room_type_checklist_defaults')
		.all();

	const withDefaults = roomTypes.map((rt) => ({
		...rt,
		default_categories: defaults.filter((d) => d.room_type_id === rt.id).map((d) => d.category_key),
		default_checklist: checklistDefaults.filter((c) => c.room_type_id === rt.id).map((c) => c.label)
	}));

	return json({ room_types: withDefaults });
}
```

- [ ] **Step 7: Manually verify the routes with the dev server**

Run: `npm run dev &` then, in another shell:

```bash
curl -s -X POST http://localhost:5173/api/rooms -H 'content-type: application/json' \
  -d '{"name":"Test Kitchen"}' | head -c 500
curl -s http://localhost:5173/api/rooms | head -c 500
curl -s http://localhost:5173/api/room-types | head -c 500
```

Expected: each call returns a JSON body with the expected shape and no 500 errors. Stop the dev
server (`kill %1`) once confirmed.

- [ ] **Step 8: Commit**

```bash
git add src/routes/api/rooms src/routes/api/whole-home-items src/routes/api/categories src/routes/api/room-types
git commit -m "feat: REST API routes for rooms, whole-home items, categories, room types"
```

---

## Task 8: REST API routes — research notes, purchases, network summary, self-documenting index

**Files:**
- Create: `src/routes/api/rooms/[id]/research/+server.js`
- Create: `src/routes/api/whole-home-items/[id]/research/+server.js`
- Create: `src/routes/api/purchases/+server.js`
- Create: `src/routes/api/rooms/[id]/network-summary/+server.js`
- Create: `src/routes/api/+server.js`

**Interfaces:**
- Consumes: `createResearchNote` from `$lib/server/research.js`; `createPurchase`,
  `listPurchases` from `$lib/server/purchases.js`; `getRoom` from `$lib/server/rooms.js`;
  `computeNetworkSummary` from `$lib/server/networkSummary.js`.
- Produces: the last of the v1 API surface, including the AI-facing write endpoints.

- [ ] **Step 1: Write `src/routes/api/rooms/[id]/research/+server.js`**

```js
import { json } from '@sveltejs/kit';
import { createResearchNote } from '$lib/server/research.js';
import { getRoom } from '$lib/server/rooms.js';

export async function POST({ params, request }) {
	const room = getRoom(params.id);
	if (!room) return json({ error: 'room not found' }, { status: 404 });

	const { category_id, body, sources } = await request.json();
	if (!body) return json({ error: 'body is required' }, { status: 400 });

	const note = createResearchNote({ room_id: params.id, category_id, body, sources });
	return json({ research_note: note }, { status: 201 });
}
```

- [ ] **Step 2: Write `src/routes/api/whole-home-items/[id]/research/+server.js`**

```js
import { json } from '@sveltejs/kit';
import { createResearchNote } from '$lib/server/research.js';
import { getWholeHomeItem } from '$lib/server/wholeHomeItems.js';

export async function POST({ params, request }) {
	const item = getWholeHomeItem(params.id);
	if (!item) return json({ error: 'whole-home item not found' }, { status: 404 });

	const { category_id, body, sources } = await request.json();
	if (!body) return json({ error: 'body is required' }, { status: 400 });

	const note = createResearchNote({ whole_home_item_id: params.id, category_id, body, sources });
	return json({ research_note: note }, { status: 201 });
}
```

- [ ] **Step 3: Write `src/routes/api/purchases/+server.js`**

```js
import { json } from '@sveltejs/kit';
import { createPurchase, listPurchases } from '$lib/server/purchases.js';

export function GET() {
	return json({ purchases: listPurchases() });
}

export async function POST({ request }) {
	const fields = await request.json();
	if (!fields.item) return json({ error: 'item is required' }, { status: 400 });
	try {
		const purchase = createPurchase(fields);
		return json({ purchase }, { status: 201 });
	} catch (err) {
		return json({ error: err.message }, { status: 400 });
	}
}
```

- [ ] **Step 4: Write `src/routes/api/rooms/[id]/network-summary/+server.js`**

```js
import { json } from '@sveltejs/kit';
import { getRoom } from '$lib/server/rooms.js';
import { computeNetworkSummary } from '$lib/server/networkSummary.js';

export function GET({ params }) {
	const room = getRoom(params.id);
	if (!room) return json({ error: 'room not found' }, { status: 404 });

	const summary = computeNetworkSummary({
		endpointCount: room.network_endpoints.length,
		distanceFromClosetFt: room.distance_from_closet_ft
	});

	return json({ room_id: room.id, endpoints: room.network_endpoints, ...summary });
}
```

- [ ] **Step 5: Write `src/routes/api/+server.js`**

```js
import { json } from '@sveltejs/kit';

/** Self-documenting index so an AI agent can discover the surface with one GET. */
export function GET() {
	return json({
		name: 'FusionFrame API',
		description:
			'Plan a future home build/renovation: room and whole-home-item tech/finish decisions, ' +
			'network line-drop estimates, and purchases. Auth is not implemented in v1 — deploy this ' +
			'behind your own reverse proxy or VPN if exposing it beyond localhost.',
		endpoints: [
			{ method: 'GET', path: '/api/rooms', description: 'List all rooms with their room type label.' },
			{ method: 'POST', path: '/api/rooms', description: 'Create a room. Body: {"name": string, "room_type_id"?: number, ...physical attributes}. Setting room_type_id materializes that type\'s default categories and checklist items.' },
			{ method: 'GET', path: '/api/rooms/{id}', description: 'One room with its categories, checklist, and network endpoints.' },
			{ method: 'PATCH', path: '/api/rooms/{id}', description: 'Update a room\'s physical attributes or name.' },
			{ method: 'DELETE', path: '/api/rooms/{id}', description: 'Delete a room and everything under it.' },
			{ method: 'GET', path: '/api/rooms/{id}/network-summary', description: 'Computed drop count, estimated cable footage, and whether the run exceeds the 328ft practical Ethernet limit.' },
			{ method: 'POST', path: '/api/rooms/{id}/research', description: 'Write a research finding to a room. Body: {"category_id"?: number, "body": string, "sources"?: string}. This is the primary AI-write target for research.' },
			{ method: 'GET', path: '/api/whole-home-items', description: 'List whole-home items (networking, electrical, HVAC, etc.) with category label joined in.' },
			{ method: 'POST', path: '/api/whole-home-items', description: 'Create a whole-home item. Body: {"category_id": number, "name": string, "notes"?: string}.' },
			{ method: 'GET', path: '/api/whole-home-items/{id}', description: 'One whole-home item.' },
			{ method: 'PATCH', path: '/api/whole-home-items/{id}', description: 'Update a whole-home item.' },
			{ method: 'POST', path: '/api/whole-home-items/{id}/research', description: 'Write a research finding to a whole-home item. Same body shape as the room research endpoint.' },
			{ method: 'GET', path: '/api/categories', description: 'List categories. Filter with ?scope=room or ?scope=whole_home.' },
			{ method: 'GET', path: '/api/room-types', description: 'List room types with their default categories and checklist items.' },
			{ method: 'GET', path: '/api/purchases', description: 'List all purchases.' },
			{ method: 'POST', path: '/api/purchases', description: 'Log a purchase candidate. Body: {"item": string, "vendor"?: string, "price"?: number, "status"?: "researching"|"considering"|"purchased"|"installed", "link"?: string, "room_id" or "whole_home_item_id": number (exactly one required)}.' }
		]
	});
}
```

- [ ] **Step 6: Manually verify with the dev server**

Run: `npm run dev &` then:

```bash
curl -s http://localhost:5173/api | head -c 300
ROOM_ID=$(curl -s -X POST http://localhost:5173/api/rooms -H 'content-type: application/json' -d '{"name":"Living Room","distance_from_closet_ft":50}' | node -pe "JSON.parse(require('fs').readFileSync(0)).room.id" 2>/dev/null || true)
curl -s -X POST "http://localhost:5173/api/rooms/$ROOM_ID/research" -H 'content-type: application/json' -d '{"body":"test finding","sources":"example.com"}'
curl -s "http://localhost:5173/api/rooms/$ROOM_ID/network-summary"
curl -s -X POST http://localhost:5173/api/purchases -H 'content-type: application/json' -d "{\"item\":\"Speaker\",\"room_id\":$ROOM_ID}"
```

Expected: every call returns JSON with no 500s; `network-summary` returns `dropCount: 1` and
`estimatedCableFootage: 50`. Stop the dev server (`kill %1`).

- [ ] **Step 7: Commit**

```bash
git add src/routes/api
git commit -m "feat: research, purchases, network-summary, and self-documenting API index"
```

---

## Task 9: UI shell and navigation

**Files:**
- Modify: `src/routes/+layout.svelte`
- Create: `src/lib/components/Sidebar.svelte`
- Create: `src/routes/+page.server.js`
- Create: `src/routes/+page.svelte`

**Interfaces:**
- Consumes: nothing new (static nav).
- Produces: the app shell every page in Tasks 10–12 renders inside.

- [ ] **Step 1: Write `src/lib/components/Sidebar.svelte`**

```svelte
<script>
	let { current = '' } = $props();

	const links = [
		{ href: '/rooms', label: 'Rooms' },
		{ href: '/whole-home', label: 'Whole-Home Items' },
		{ href: '/purchases', label: 'Purchases' }
	];
</script>

<nav class="sidebar">
	<div class="brand">FusionFrame</div>
	<ul>
		{#each links as link}
			<li>
				<a href={link.href} class:active={current.startsWith(link.href)}>{link.label}</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.sidebar {
		width: 220px;
		flex-shrink: 0;
		border-right: 1px solid var(--border);
		padding: 1.5rem 1rem;
		min-height: 100vh;
	}
	.brand {
		font-weight: 700;
		margin-bottom: 1.5rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	a {
		display: block;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		color: var(--fg);
		text-decoration: none;
	}
	a.active {
		background: var(--accent);
		color: white;
	}
</style>
```

- [ ] **Step 2: Rewrite `src/routes/+layout.svelte`**

```svelte
<script>
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<div style="display: flex;">
	<Sidebar current={page.url.pathname} />
	<main style="flex: 1; padding: 2rem; max-width: 900px;">
		{@render children()}
	</main>
</div>
```

- [ ] **Step 3: Write `src/routes/+page.server.js`**

```js
import { redirect } from '@sveltejs/kit';

export function load() {
	redirect(307, '/rooms');
}
```

- [ ] **Step 4: Write a placeholder `src/routes/+page.svelte`**

```svelte
<!-- Never rendered — +page.server.js always redirects to /rooms -->
```

- [ ] **Step 5: Verify the shell renders and redirects**

Run: `npm run dev &`

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:5173/
```

Expected: `307` with a redirect URL ending in `/rooms`. Stop the dev server (`kill %1`).

- [ ] **Step 6: Commit**

```bash
git add src/routes/+layout.svelte src/lib/components/Sidebar.svelte src/routes/+page.server.js src/routes/+page.svelte
git commit -m "feat: app shell with sidebar navigation"
```

---

## Task 10: Rooms UI — list, create, detail

**Files:**
- Create: `src/routes/rooms/+page.server.js`
- Create: `src/routes/rooms/+page.svelte`
- Create: `src/routes/rooms/[id]/+page.server.js`
- Create: `src/routes/rooms/[id]/+page.svelte`

**Interfaces:**
- Consumes: `listRooms`, `createRoom`, `getRoom`, `updateRoom` from `$lib/server/rooms.js`; `db`
  from `$lib/server/db.js` for the room-type dropdown.
- Produces: the primary UI surface for room planning.

- [ ] **Step 1: Write `src/routes/rooms/+page.server.js`**

```js
import { listRooms, createRoom } from '$lib/server/rooms.js';
import { db } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';

export function load() {
	const rooms = listRooms();
	const roomTypes = db.prepare('SELECT * FROM room_types ORDER BY label').all();
	return { rooms, roomTypes };
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name');
		const roomTypeId = form.get('room_type_id');
		const room = createRoom({
			name,
			room_type_id: roomTypeId ? Number(roomTypeId) : undefined
		});
		redirect(303, `/rooms/${room.id}`);
	}
};
```

- [ ] **Step 2: Write `src/routes/rooms/+page.svelte`**

```svelte
<script>
	let { data } = $props();
</script>

<h1>Rooms</h1>

<ul>
	{#each data.rooms as room}
		<li><a href="/rooms/{room.id}">{room.name}</a> {#if room.room_type_label}<span>— {room.room_type_label}</span>{/if}</li>
	{/each}
</ul>

<h2>Add a room</h2>
<form method="POST" action="?/create">
	<label>
		Name
		<input name="name" required />
	</label>
	<label>
		Room type
		<select name="room_type_id">
			<option value="">— none —</option>
			{#each data.roomTypes as rt}
				<option value={rt.id}>{rt.label}</option>
			{/each}
		</select>
	</label>
	<button type="submit">Create room</button>
</form>
```

- [ ] **Step 3: Write `src/routes/rooms/[id]/+page.server.js`**

```js
import { getRoom, updateRoom } from '$lib/server/rooms.js';
import { db } from '$lib/server/db.js';
import { error, redirect } from '@sveltejs/kit';

const PHYSICAL_FIELDS = [
	'sqft',
	'ceiling_height_in',
	'floor_level',
	'distance_from_closet_ft',
	'exterior_wall_count',
	'window_count',
	'window_type',
	'compass_orientation',
	'flooring_type',
	'paint_color',
	'accessibility_notes'
];

export function load({ params }) {
	const room = getRoom(params.id);
	if (!room) error(404, 'Room not found');
	const allCategories = db.prepare("SELECT * FROM categories WHERE scope = 'room' ORDER BY sort_order").all();
	return { room, allCategories };
}

export const actions = {
	updateAttributes: async ({ params, request }) => {
		const form = await request.formData();
		const fields = {};
		for (const key of PHYSICAL_FIELDS) {
			const value = form.get(key);
			if (value !== null && value !== '') fields[key] = value;
		}
		updateRoom(params.id, fields);
		return { success: true };
	}
};
```

- [ ] **Step 4: Write `src/routes/rooms/[id]/+page.svelte`**

```svelte
<script>
	let { data } = $props();
	const { room } = data;
</script>

<h1>{room.name}</h1>
{#if room.room_type_label}<p><em>{room.room_type_label}</em></p>{/if}

<h2>Physical attributes</h2>
<form method="POST" action="?/updateAttributes">
	<label>Square footage <input name="sqft" type="number" value={room.sqft ?? ''} /></label>
	<label>Ceiling height (in) <input name="ceiling_height_in" type="number" value={room.ceiling_height_in ?? ''} /></label>
	<label>Floor level <input name="floor_level" type="number" value={room.floor_level ?? ''} /></label>
	<label>Distance from wiring closet (ft) <input name="distance_from_closet_ft" type="number" value={room.distance_from_closet_ft ?? ''} /></label>
	<label>Exterior wall count <input name="exterior_wall_count" type="number" value={room.exterior_wall_count ?? ''} /></label>
	<label>Window count <input name="window_count" type="number" value={room.window_count ?? ''} /></label>
	<label>Window type <input name="window_type" value={room.window_type ?? ''} /></label>
	<label>Compass orientation <input name="compass_orientation" value={room.compass_orientation ?? ''} /></label>
	<label>Flooring type <input name="flooring_type" value={room.flooring_type ?? ''} /></label>
	<label>Paint color <input name="paint_color" value={room.paint_color ?? ''} /></label>
	<label>Accessibility notes <textarea name="accessibility_notes">{room.accessibility_notes ?? ''}</textarea></label>
	<button type="submit">Save</button>
</form>

<h2>Categories</h2>
{#if room.categories.length === 0}
	<p>No categories yet.</p>
{:else}
	<ul>
		{#each room.categories as category}
			<li><strong>{category.label}</strong>{#if category.notes} — {category.notes}{/if}</li>
		{/each}
	</ul>
{/if}

<h2>Checklist</h2>
{#if room.checklist.length === 0}
	<p>No checklist items yet.</p>
{:else}
	<ul>
		{#each room.checklist as item}
			<li>{item.label} — <em>{item.status}</em></li>
		{/each}
	</ul>
{/if}

<h2>Network endpoints</h2>
{#if room.network_endpoints.length === 0}
	<p>No wired endpoints logged yet.</p>
{:else}
	<ul>
		{#each room.network_endpoints as endpoint}
			<li>{endpoint.device_name} ({endpoint.device_type}){#if endpoint.needs_poe} — PoE{/if}</li>
		{/each}
	</ul>
{/if}
```

- [ ] **Step 5: Verify the rooms UI end-to-end with the dev server**

Run: `npm run dev &` then open `http://localhost:5173/rooms` and: create a room with room type
"Kitchen", confirm it redirects to the room detail page, confirm the Categories and Checklist
sections show the materialized kitchen defaults (Non-tech/Electrical/Networking categories,
range/fridge/dishwasher/vent hood/disposal/sink checklist), edit a physical attribute (e.g. Paint
color), submit, and confirm the value persists on reload. Stop the dev server (`kill %1`).

- [ ] **Step 6: Commit**

```bash
git add src/routes/rooms
git commit -m "feat: rooms list, create form, and detail page"
```

---

## Task 11: Whole-home items UI

**Files:**
- Create: `src/routes/whole-home/+page.server.js`
- Create: `src/routes/whole-home/+page.svelte`
- Create: `src/routes/whole-home/[id]/+page.server.js`
- Create: `src/routes/whole-home/[id]/+page.svelte`

**Interfaces:**
- Consumes: `listWholeHomeItems`, `createWholeHomeItem`, `getWholeHomeItem`,
  `updateWholeHomeItem` from `$lib/server/wholeHomeItems.js`; `db` for the category dropdown.
- Produces: the whole-home mirror of Task 10's room UI.

- [ ] **Step 1: Write `src/routes/whole-home/+page.server.js`**

```js
import { listWholeHomeItems, createWholeHomeItem } from '$lib/server/wholeHomeItems.js';
import { db } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';

export function load() {
	const items = listWholeHomeItems();
	const categories = db.prepare("SELECT * FROM categories WHERE scope = 'whole_home' ORDER BY sort_order").all();
	return { items, categories };
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const item = createWholeHomeItem({
			name: form.get('name'),
			category_id: Number(form.get('category_id')),
			notes: form.get('notes') || ''
		});
		redirect(303, `/whole-home/${item.id}`);
	}
};
```

- [ ] **Step 2: Write `src/routes/whole-home/+page.svelte`**

```svelte
<script>
	let { data } = $props();
</script>

<h1>Whole-Home Items</h1>

<ul>
	{#each data.items as item}
		<li><a href="/whole-home/{item.id}">{item.name}</a> — <span>{item.category_label}</span></li>
	{/each}
</ul>

<h2>Add a whole-home item</h2>
<form method="POST" action="?/create">
	<label>
		Name
		<input name="name" required />
	</label>
	<label>
		Category
		<select name="category_id" required>
			{#each data.categories as category}
				<option value={category.id}>{category.label}</option>
			{/each}
		</select>
	</label>
	<label>
		Notes
		<textarea name="notes"></textarea>
	</label>
	<button type="submit">Create item</button>
</form>
```

- [ ] **Step 3: Write `src/routes/whole-home/[id]/+page.server.js`**

```js
import { getWholeHomeItem, updateWholeHomeItem } from '$lib/server/wholeHomeItems.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
	const item = getWholeHomeItem(params.id);
	if (!item) error(404, 'Whole-home item not found');
	return { item };
}

export const actions = {
	updateNotes: async ({ params, request }) => {
		const form = await request.formData();
		updateWholeHomeItem(params.id, { notes: form.get('notes') || '' });
		return { success: true };
	}
};
```

- [ ] **Step 4: Write `src/routes/whole-home/[id]/+page.svelte`**

```svelte
<script>
	let { data } = $props();
	const { item } = data;
</script>

<h1>{item.name}</h1>
<p><em>{item.category_label}</em></p>

<form method="POST" action="?/updateNotes">
	<label>
		Notes
		<textarea name="notes">{item.notes}</textarea>
	</label>
	<button type="submit">Save</button>
</form>
```

- [ ] **Step 5: Verify the whole-home items UI end-to-end**

Run: `npm run dev &` then open `http://localhost:5173/whole-home`, create an item under
"Networking" named "Main wiring closet", confirm it redirects to the detail page, edit its
notes, and confirm the value persists on reload. Stop the dev server (`kill %1`).

- [ ] **Step 6: Commit**

```bash
git add src/routes/whole-home
git commit -m "feat: whole-home items list, create form, and detail page"
```

---

## Task 12: Purchases UI

**Files:**
- Create: `src/routes/purchases/+page.server.js`
- Create: `src/routes/purchases/+page.svelte`

**Interfaces:**
- Consumes: `listPurchases`, `createPurchase` from `$lib/server/purchases.js`; `listRooms` from
  `$lib/server/rooms.js`; `listWholeHomeItems` from `$lib/server/wholeHomeItems.js`.
- Produces: the last UI page in v1.

- [ ] **Step 1: Write `src/routes/purchases/+page.server.js`**

```js
import { listPurchases, createPurchase } from '$lib/server/purchases.js';
import { listRooms } from '$lib/server/rooms.js';
import { listWholeHomeItems } from '$lib/server/wholeHomeItems.js';

export function load() {
	return {
		purchases: listPurchases(),
		rooms: listRooms(),
		wholeHomeItems: listWholeHomeItems()
	};
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const target = form.get('target'); // "room:3" or "whole_home_item:2"
		const [kind, id] = target.split(':');

		const fields = {
			item: form.get('item'),
			vendor: form.get('vendor') || '',
			price: form.get('price') ? Number(form.get('price')) : null,
			status: form.get('status') || 'researching',
			link: form.get('link') || ''
		};
		if (kind === 'room') fields.room_id = Number(id);
		if (kind === 'whole_home_item') fields.whole_home_item_id = Number(id);

		createPurchase(fields);
		return { success: true };
	}
};
```

- [ ] **Step 2: Write `src/routes/purchases/+page.svelte`**

```svelte
<script>
	let { data } = $props();
</script>

<h1>Purchases</h1>

<table>
	<thead>
		<tr>
			<th>Item</th>
			<th>Vendor</th>
			<th>Price</th>
			<th>Status</th>
		</tr>
	</thead>
	<tbody>
		{#each data.purchases as purchase}
			<tr>
				<td>{purchase.item}</td>
				<td>{purchase.vendor}</td>
				<td>{purchase.price ?? ''}</td>
				<td>{purchase.status}</td>
			</tr>
		{/each}
	</tbody>
</table>

<h2>Log a purchase</h2>
<form method="POST" action="?/create">
	<label>Item <input name="item" required /></label>
	<label>Vendor <input name="vendor" /></label>
	<label>Price <input name="price" type="number" step="0.01" /></label>
	<label>
		Status
		<select name="status">
			<option value="researching">Researching</option>
			<option value="considering">Considering</option>
			<option value="purchased">Purchased</option>
			<option value="installed">Installed</option>
		</select>
	</label>
	<label>Link <input name="link" type="url" /></label>
	<label>
		Belongs to
		<select name="target" required>
			<optgroup label="Rooms">
				{#each data.rooms as room}
					<option value={`room:${room.id}`}>{room.name}</option>
				{/each}
			</optgroup>
			<optgroup label="Whole-Home Items">
				{#each data.wholeHomeItems as item}
					<option value={`whole_home_item:${item.id}`}>{item.name}</option>
				{/each}
			</optgroup>
		</select>
	</label>
	<button type="submit">Log purchase</button>
</form>
```

- [ ] **Step 3: Verify the purchases UI end-to-end**

Run: `npm run dev &` then open `http://localhost:5173/purchases`, log a purchase against an
existing room, and confirm it appears in the table on reload. Stop the dev server (`kill %1`).

- [ ] **Step 4: Commit**

```bash
git add src/routes/purchases
git commit -m "feat: purchases list and create form"
```

---

## Task 13: Dockerfile and standalone compose file

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `docker-compose.yml`
- Modify: `README.md` (create if absent)

**Interfaces:**
- Consumes: the built `build/index.js` output from `npm run build` (Tasks 1–12 must all be
  complete and committed first).
- Produces: a `docker build` + `docker run`/`docker compose up` path that works with zero other
  services configured, satisfying the spec's standalone-container constraint.

- [ ] **Step 1: Write `Dockerfile`**

```dockerfile
FROM node:24-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    DATA_DIR=/data \
    PORT=3000
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
VOLUME /data
CMD ["node", "build/index.js"]
```

- [ ] **Step 2: Write `.dockerignore`**

```
node_modules
build
.svelte-kit
data
.env
.git
```

- [ ] **Step 3: Write `docker-compose.yml`**

```yaml
services:
  fusionframe:
    build: .
    container_name: fusionframe
    ports:
      - "3000:3000"
    environment:
      - ORIGIN=http://localhost:3000
    volumes:
      - fusionframe-data:/data
    restart: unless-stopped

volumes:
  fusionframe-data:
```

- [ ] **Step 4: Write `README.md`**

```markdown
# FusionFrame

A self-hosted app for planning a future home build or renovation — room-by-room smart-home tech
(presence, light, climate, automations, sound, security), non-tech finish decisions (paint,
flooring, appliances), whole-home infrastructure (networking, electrical, HVAC, plumbing, and
more), and a network line-drop estimator, all exposed over a self-documenting REST API so an AI
agent can research topics and write findings directly into the app.

## Running it

FusionFrame is a fully standalone Docker container — no external services required.

```bash
docker compose up --build
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
```

- [ ] **Step 5: Build and run the container, verify it serves traffic with no other services**

Run:

```bash
docker compose up --build -d
sleep 3
curl -s http://localhost:3000/api | head -c 200
docker compose down
```

Expected: the `curl` call returns the `/api` index JSON with no errors, proving the container is
fully self-contained. If `docker`/`docker compose` isn't available in this environment, note
that in the plan's completion report instead of skipping the check silently — it must be run
before v1 is considered done.

- [ ] **Step 6: Commit**

```bash
git add Dockerfile .dockerignore docker-compose.yml README.md
git commit -m "feat: standalone Dockerfile and compose file"
```

---

## Post-plan note

Deferred items (budget/Actual integration, purchases-to-budget linkage, project-management/
kanban layer gated by a `phase` field, OIDC auth, UI theming with Tailwind/shadcn-svelte, MCP
server wrapper) are intentionally out of scope for this plan — each gets its own future spec and
plan when picked up, per the design spec's "Explicitly deferred" section.
