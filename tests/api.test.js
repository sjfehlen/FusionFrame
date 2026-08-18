import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('api route handlers', () => {
	let db, roomsPOST, wholeHomeItemsPOST;

	beforeAll(async () => {
		process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionframe-test-'));
		({ db } = await import('../src/lib/server/db.js'));
		({ POST: roomsPOST } = await import('../src/routes/api/rooms/+server.js'));
		({ POST: wholeHomeItemsPOST } = await import('../src/routes/api/whole-home-items/+server.js'));
	});

	function wholeHomeCategoryId() {
		return db.prepare("SELECT id FROM categories WHERE scope = 'whole_home' AND key = 'networking'").get().id;
	}

	function roomCategoryId() {
		return db.prepare("SELECT id FROM categories WHERE scope = 'room' AND key = 'presence'").get().id;
	}

	it('POST /api/rooms with a nonexistent room_type_id returns 400 with an error field', async () => {
		const fakeRequest = { json: async () => ({ name: 'Bad Room', room_type_id: 999999 }) };
		const response = await roomsPOST({ request: fakeRequest });
		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body.error).toBeTypeOf('string');
	});

	it('POST /api/rooms with valid data returns 201 and the created room', async () => {
		const fakeRequest = { json: async () => ({ name: 'Good Room' }) };
		const response = await roomsPOST({ request: fakeRequest });
		expect(response.status).toBe(201);
		const body = await response.json();
		expect(body.room.name).toBe('Good Room');
	});

	it('POST /api/whole-home-items with a room-scoped category_id returns 400 with an error field', async () => {
		const fakeRequest = {
			json: async () => ({ name: 'Bad Item', category_id: roomCategoryId() })
		};
		const response = await wholeHomeItemsPOST({ request: fakeRequest });
		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body.error).toBeTypeOf('string');
	});

	it('POST /api/whole-home-items with a valid whole_home-scoped category_id returns 201', async () => {
		const fakeRequest = {
			json: async () => ({ name: 'Good Item', category_id: wholeHomeCategoryId() })
		};
		const response = await wholeHomeItemsPOST({ request: fakeRequest });
		expect(response.status).toBe(201);
		const body = await response.json();
		expect(body.whole_home_item.name).toBe('Good Item');
	});
});
