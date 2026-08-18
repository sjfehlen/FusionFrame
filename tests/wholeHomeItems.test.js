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
