import { json } from '@sveltejs/kit';
import { createRoom, listRooms } from '$lib/server/rooms.js';

export function GET() {
	return json({ rooms: listRooms() });
}

export async function POST({ request }) {
	const fields = await request.json();
	if (!fields.name) {
		return json({ error: 'name is required' }, { status: 400 });
	}
	try {
		const room = createRoom(fields);
		return json({ room }, { status: 201 });
	} catch (err) {
		return json({ error: err.message }, { status: 400 });
	}
}
