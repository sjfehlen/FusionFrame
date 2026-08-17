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
