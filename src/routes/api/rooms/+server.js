import { json } from '@sveltejs/kit';
import { createRoom, listRooms } from '$lib/server/rooms.js';
import { parseJsonBody, mutate } from '$lib/server/apiHelpers.js';

export function GET() {
	return json({ rooms: listRooms() });
}

export async function POST({ request }) {
	const parsed = await parseJsonBody(request);
	if (parsed.error) return json({ error: parsed.error }, { status: 400 });
	const fields = parsed.body;

	if (!fields.name) {
		return json({ error: 'name is required' }, { status: 400 });
	}
	return mutate(
		() => createRoom(fields),
		(room) => ({ room }),
		201
	);
}
