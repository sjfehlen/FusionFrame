import { listRooms, createRoom } from '$lib/server/rooms.js';
import { db } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';

export function load() {
	const rooms = listRooms();
	const roomTypes = db.prepare('SELECT * FROM room_types ORDER BY label').all();
	return { rooms, roomTypes };
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name');
		const roomTypeId = form.get('room_type_id');
		const room = createRoom({
			name,
			room_type_id: roomTypeId ? Number(roomTypeId) : undefined
		});
		redirect(303, `/rooms/${room.id}`);
	}
};
