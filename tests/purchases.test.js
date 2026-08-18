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
