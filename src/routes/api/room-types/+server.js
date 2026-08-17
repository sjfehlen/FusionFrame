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
