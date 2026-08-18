import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/**
 * Regression tests for the "unvalidated input reaches a DB call and throws an
 * uncaught 500" defect class. Every case below previously threw out of the
 * handler; each must now return a clean 4xx JSON `{ error }` response.
 */
describe('mutating API routes reject malformed and adversarial input', () => {
	let db;
	let roomsPOST, roomPATCH, roomResearchPOST;
	let itemsPOST, itemPATCH, itemResearchPOST;
	let purchasesPOST;
	let roomId, itemId;

	/** Build a fake RequestEvent request whose body parses to `value`. */
	function req(value) {
		return { json: async () => value };
	}

	/** A request whose body is genuinely malformed JSON. */
	function badJsonReq() {
		return {
			json: async () => {
				throw new SyntaxError('Unexpected token');
			}
		};
	}

	async function expectError(promise, status = 400) {
		const response = await promise;
		expect(response.status).toBe(status);
		const body = await response.json();
		expect(body.error).toBeTypeOf('string');
		return body;
	}

	beforeAll(async () => {
		process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionframe-test-'));
		({ db } = await import('../src/lib/server/db.js'));
		({ POST: roomsPOST } = await import('../src/routes/api/rooms/+server.js'));
		({ PATCH: roomPATCH } = await import('../src/routes/api/rooms/[id]/+server.js'));
		({ POST: roomResearchPOST } = await import('../src/routes/api/rooms/[id]/research/+server.js'));
		({ POST: itemsPOST } = await import('../src/routes/api/whole-home-items/+server.js'));
		({ PATCH: itemPATCH } = await import('../src/routes/api/whole-home-items/[id]/+server.js'));
		({ POST: itemResearchPOST } = await import(
			'../src/routes/api/whole-home-items/[id]/research/+server.js'
		));
		({ POST: purchasesPOST } = await import('../src/routes/api/purchases/+server.js'));

		const created = await (await roomsPOST({ request: req({ name: 'Fixture Room' }) })).json();
		roomId = String(created.room.id);

		const itemResponse = await itemsPOST({
			request: req({ name: 'Fixture Item', category_id: wholeHomeCategoryId() })
		});
		itemId = String((await itemResponse.json()).whole_home_item.id);
	});

	function wholeHomeCategoryId() {
		return db
			.prepare("SELECT id FROM categories WHERE scope = 'whole_home' AND key = 'networking'")
			.get().id;
	}

	function roomCategoryId() {
		return db
			.prepare("SELECT id FROM categories WHERE scope = 'room' AND key = 'presence'")
			.get().id;
	}

	describe('body parsing (all mutating routes)', () => {
		const cases = [
			['null body', null],
			['array body', [1, 2, 3]],
			['string body', 'not an object'],
			['number body', 42]
		];

		for (const [label, value] of cases) {
			it(`POST /api/rooms rejects a ${label}`, () =>
				expectError(roomsPOST({ request: req(value) })));

			it(`POST /api/purchases rejects a ${label}`, () =>
				expectError(purchasesPOST({ request: req(value) })));

			it(`POST /api/whole-home-items rejects a ${label}`, () =>
				expectError(itemsPOST({ request: req(value) })));

			it(`PATCH /api/rooms/[id] rejects a ${label}`, () =>
				expectError(roomPATCH({ params: { id: roomId }, request: req(value) })));

			it(`PATCH /api/whole-home-items/[id] rejects a ${label}`, () =>
				expectError(itemPATCH({ params: { id: itemId }, request: req(value) })));

			it(`POST /api/rooms/[id]/research rejects a ${label}`, () =>
				expectError(roomResearchPOST({ params: { id: roomId }, request: req(value) })));

			it(`POST /api/whole-home-items/[id]/research rejects a ${label}`, () =>
				expectError(itemResearchPOST({ params: { id: itemId }, request: req(value) })));
		}

		it('rejects genuinely malformed JSON that fails request.json()', async () => {
			const body = await expectError(roomsPOST({ request: badJsonReq() }));
			expect(body.error).toMatch(/invalid JSON/i);
		});
	});

	describe('PATCH /api/rooms/[id]', () => {
		it('rejects a nested object for name instead of throwing a RangeError', () =>
			expectError(roomPATCH({ params: { id: roomId }, request: req({ name: { a: 1 } }) })));

		it('rejects a null name (NOT NULL constraint) with a 400', () =>
			expectError(roomPATCH({ params: { id: roomId }, request: req({ name: null }) })));

		it('rejects a nonexistent room_type_id (FK constraint) with a 400', () =>
			expectError(roomPATCH({ params: { id: roomId }, request: req({ room_type_id: 999999 }) })));

		it('rejects a non-numeric distance_from_closet_ft', async () => {
			const body = await expectError(
				roomPATCH({ params: { id: roomId }, request: req({ distance_from_closet_ft: 'far' }) })
			);
			expect(body.error).toMatch(/distance_from_closet_ft/);
		});

		it('rejects a non-numeric sqft', () =>
			expectError(roomPATCH({ params: { id: roomId }, request: req({ sqft: 'big' }) })));

		it('still applies a valid update', async () => {
			const response = await roomPATCH({
				params: { id: roomId },
				request: req({ name: 'Renamed Room', distance_from_closet_ft: 42 })
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.room.name).toBe('Renamed Room');
			expect(body.room.distance_from_closet_ft).toBe(42);
		});
	});

	describe('PATCH /api/whole-home-items/[id]', () => {
		it('rejects a room-scoped category_id, matching the create-path invariant', async () => {
			const body = await expectError(
				itemPATCH({ params: { id: itemId }, request: req({ category_id: roomCategoryId() }) })
			);
			expect(body.error).toMatch(/whole_home/);
		});

		it('rejects a nonexistent category_id', () =>
			expectError(itemPATCH({ params: { id: itemId }, request: req({ category_id: 999999 }) })));

		it('rejects a non-numeric category_id', () =>
			expectError(itemPATCH({ params: { id: itemId }, request: req({ category_id: 'oops' }) })));

		it('rejects a nested object for name', () =>
			expectError(itemPATCH({ params: { id: itemId }, request: req({ name: { a: 1 } }) })));

		it('rejects a null name', () =>
			expectError(itemPATCH({ params: { id: itemId }, request: req({ name: null }) })));

		it('still applies a valid update', async () => {
			const response = await itemPATCH({
				params: { id: itemId },
				request: req({ notes: 'updated notes' })
			});
			expect(response.status).toBe(200);
			expect((await response.json()).whole_home_item.notes).toBe('updated notes');
		});
	});

	describe('research routes', () => {
		it('rejects a nonexistent category_id on a room note', () =>
			expectError(
				roomResearchPOST({
					params: { id: roomId },
					request: req({ body: 'note', category_id: 999999 })
				})
			));

		it('rejects a non-numeric category_id on a room note', () =>
			expectError(
				roomResearchPOST({
					params: { id: roomId },
					request: req({ body: 'note', category_id: 'nope' })
				})
			));

		it('rejects a nested object for body on a whole-home note', () =>
			expectError(
				itemResearchPOST({ params: { id: itemId }, request: req({ body: { a: 1 } }) })
			));

		it('still creates a valid room research note', async () => {
			const response = await roomResearchPOST({
				params: { id: roomId },
				request: req({ body: 'a real note' })
			});
			expect(response.status).toBe(201);
			expect((await response.json()).research_note.body).toBe('a real note');
		});
	});

	describe('POST /api/rooms and /api/purchases', () => {
		it('rejects a nested object for name on create', () =>
			expectError(roomsPOST({ request: req({ name: { a: 1 } }) })));

		it('rejects a non-numeric sqft on create', () =>
			expectError(roomsPOST({ request: req({ name: 'Numeric Room', sqft: 'lots' }) })));

		it('rejects a nested object for item on purchase create', () =>
			expectError(purchasesPOST({ request: req({ item: { a: 1 }, room_id: Number(roomId) }) })));

		it('rejects a non-numeric price on purchase create', () =>
			expectError(
				purchasesPOST({ request: req({ item: 'Lamp', price: 'cheap', room_id: Number(roomId) }) })
			));
	});
});

describe('form actions reject File-valued and non-numeric fields', () => {
	let roomsCreate, roomUpdateAttributes, purchasesCreate, wholeHomeCreate, wholeHomeUpdateNotes;
	let db, roomId, itemId;

	function formRequest(entries) {
		const form = new FormData();
		for (const [key, value] of entries) form.append(key, value);
		return { formData: async () => form };
	}

	const aFile = () => new File(['payload'], 'evil.txt', { type: 'text/plain' });

	beforeAll(async () => {
		process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionframe-test-'));
		({ db } = await import('../src/lib/server/db.js'));
		({ actions: { create: roomsCreate } } = await import('../src/routes/rooms/+page.server.js'));
		({ actions: { updateAttributes: roomUpdateAttributes } } = await import(
			'../src/routes/rooms/[id]/+page.server.js'
		));
		({ actions: { create: purchasesCreate } } = await import(
			'../src/routes/purchases/+page.server.js'
		));
		({ actions: { create: wholeHomeCreate } } = await import(
			'../src/routes/whole-home/+page.server.js'
		));
		({ actions: { updateNotes: wholeHomeUpdateNotes } } = await import(
			'../src/routes/whole-home/[id]/+page.server.js'
		));

		const { createRoom } = await import('../src/lib/server/rooms.js');
		const { createWholeHomeItem } = await import('../src/lib/server/wholeHomeItems.js');
		roomId = String(createRoom({ name: 'Form Fixture Room' }).id);
		const categoryId = db
			.prepare("SELECT id FROM categories WHERE scope = 'whole_home' AND key = 'networking'")
			.get().id;
		itemId = String(createWholeHomeItem({ name: 'Form Fixture Item', category_id: categoryId }).id);
	});

	function expectFail(result) {
		expect(result.status).toBe(400);
		expect(result.data.error).toBeTypeOf('string');
	}

	it('rooms create rejects a File-valued name', async () => {
		expectFail(await roomsCreate({ request: formRequest([['name', aFile()]]) }));
	});

	it('rooms create rejects a File-valued room_type_id', async () => {
		expectFail(
			await roomsCreate({
				request: formRequest([
					['name', 'Fine Name'],
					['room_type_id', aFile()]
				])
			})
		);
	});

	it('updateAttributes rejects a non-numeric distance_from_closet_ft', async () => {
		const result = await roomUpdateAttributes({
			params: { id: roomId },
			request: formRequest([['distance_from_closet_ft', 'quite far']])
		});
		expectFail(result);
		expect(result.data.error).toMatch(/distance_from_closet_ft/);
	});

	it('updateAttributes rejects a File-valued paint_color', async () => {
		expectFail(
			await roomUpdateAttributes({
				params: { id: roomId },
				request: formRequest([['paint_color', aFile()]])
			})
		);
	});

	it('updateAttributes accepts valid numeric attributes', async () => {
		const result = await roomUpdateAttributes({
			params: { id: roomId },
			request: formRequest([
				['distance_from_closet_ft', '30'],
				['sqft', '150']
			])
		});
		expect(result).toEqual({ success: true });
		const { getRoom } = await import('../src/lib/server/rooms.js');
		expect(getRoom(roomId).distance_from_closet_ft).toBe(30);
	});

	it('purchases create rejects a File-valued item', async () => {
		expectFail(
			await purchasesCreate({
				request: formRequest([
					['target', `room:${roomId}`],
					['item', aFile()]
				])
			})
		);
	});

	it('purchases create rejects a File-valued target', async () => {
		expectFail(
			await purchasesCreate({
				request: formRequest([
					['target', aFile()],
					['item', 'Lamp']
				])
			})
		);
	});

	it('purchases create rejects a non-numeric price', async () => {
		expectFail(
			await purchasesCreate({
				request: formRequest([
					['target', `room:${roomId}`],
					['item', 'Lamp'],
					['price', 'cheap']
				])
			})
		);
	});

	it('whole-home create rejects a File-valued name', async () => {
		expectFail(await wholeHomeCreate({ request: formRequest([['name', aFile()]]) }));
	});

	it('whole-home create rejects a non-numeric category_id', async () => {
		expectFail(
			await wholeHomeCreate({
				request: formRequest([
					['name', 'Item'],
					['category_id', 'not-a-number']
				])
			})
		);
	});

	it('whole-home updateNotes rejects a File-valued notes field', async () => {
		expectFail(
			await wholeHomeUpdateNotes({
				params: { id: itemId },
				request: formRequest([['notes', aFile()]])
			})
		);
	});
});
