import { db } from './db.js';
import { assertBindable, assertNumericFields } from './apiHelpers.js';

const NOTE_COLUMNS = ['room_id', 'whole_home_item_id', 'category_id', 'body', 'sources'];

export function createResearchNote({ room_id = null, whole_home_item_id = null, category_id = null, body, sources = '' }) {
	const hasRoom = room_id !== null && room_id !== undefined;
	const hasWholeHome = whole_home_item_id !== null && whole_home_item_id !== undefined;
	if (hasRoom === hasWholeHome) {
		throw new Error('A research note must be linked to exactly one of room_id or whole_home_item_id');
	}

	const fields = { room_id, whole_home_item_id, category_id, body, sources };
	assertNumericFields(fields, ['room_id', 'whole_home_item_id', 'category_id']);
	assertBindable(fields, NOTE_COLUMNS);

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
