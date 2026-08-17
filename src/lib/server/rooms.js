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
