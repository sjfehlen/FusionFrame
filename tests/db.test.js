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
		expect(rows.sort()).toEqual(['networking', 'non_tech']);
	});

	it('is idempotent — re-running the seed INSERT OR IGNORE statements does not duplicate rows', async () => {
		const before = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
		const { seed } = await import('../src/lib/server/db.js');
		seed();
		const after = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
		expect(after).toBe(before);
	});
});
