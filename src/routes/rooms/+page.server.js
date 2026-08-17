import { listRooms, createRoom } from '$lib/server/rooms.js';
import { db } from '$lib/server/db.js';
import { fail, redirect } from '@sveltejs/kit';
import { readFormString, readFormNumber } from '$lib/server/apiHelpers.js';

export function load() {
	const rooms = listRooms();
	const roomTypes = db.prepare('SELECT * FROM room_types ORDER BY label').all();
	return { rooms, roomTypes };
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();

		const name = readFormString(form, 'name', { required: true });
		if (name.error) return fail(400, { error: name.error });

		const roomTypeId = readFormNumber(form, 'room_type_id');
		if (roomTypeId.error) return fail(400, { error: roomTypeId.error });
		if (roomTypeId.value !== null) {
			const roomType = db
				.prepare('SELECT id FROM room_types WHERE id = ?')
				.get(roomTypeId.value);
			if (!roomType) {
				return fail(400, { error: 'invalid room_type_id' });
			}
		}

		let room;
		try {
			room = createRoom({
				name: name.value,
				room_type_id: roomTypeId.value ?? undefined
			});
		} catch (err) {
			return fail(400, { error: err.message });
		}
		redirect(303, `/rooms/${room.id}`);
	}
};
