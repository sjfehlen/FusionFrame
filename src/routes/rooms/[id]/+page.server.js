import { getRoom, updateRoom } from '$lib/server/rooms.js';
import { db } from '$lib/server/db.js';
import { error, redirect } from '@sveltejs/kit';

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
			const value = form.get(key);
			if (value !== null) fields[key] = value === '' ? null : value;
		}
		updateRoom(params.id, fields);
		return { success: true };
	}
};
