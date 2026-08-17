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
