import { getRoom, updateRoom, NUMERIC_ROOM_FIELDS } from '$lib/server/rooms.js';
import { db } from '$lib/server/db.js';
import { error, redirect, fail } from '@sveltejs/kit';
import { readFormString, readFormNumber } from '$lib/server/apiHelpers.js';

const PHYSICAL_FIELDS = [
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

export function load({ params }) {
	const room = getRoom(params.id);
	if (!room) error(404, 'Room not found');
	const allCategories = db.prepare("SELECT * FROM categories WHERE scope = 'room' ORDER BY sort_order").all();
	return { room, allCategories };
}

export const actions = {
	updateAttributes: async ({ params, request }) => {
		const form = await request.formData();
		const fields = {};
		for (const key of PHYSICAL_FIELDS) {
			if (form.get(key) === null) continue;
			// Numeric attributes must parse as real numbers — a non-numeric
			// distance_from_closet_ft otherwise silently poisons the network
			// summary with NaN. Text fields must genuinely be strings: a
			// multipart post can make form.get() return a File.
			const isNumeric = NUMERIC_ROOM_FIELDS.includes(key);
			const result = isNumeric ? readFormNumber(form, key) : readFormString(form, key);
			if (result.error) return fail(400, { error: result.error });
			fields[key] = result.value === '' ? null : result.value;
		}
		try {
			updateRoom(params.id, fields);
		} catch (err) {
			return fail(400, { error: err.message });
		}
		return { success: true };
	}
};
