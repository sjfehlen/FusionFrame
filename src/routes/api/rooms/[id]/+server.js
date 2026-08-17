import { json } from '@sveltejs/kit';
import { getRoom, updateRoom, deleteRoom } from '$lib/server/rooms.js';

export function GET({ params }) {
	const room = getRoom(params.id);
	if (!room) return json({ error: 'room not found' }, { status: 404 });
	return json({ room });
}

export async function PATCH({ params, request }) {
	const existing = getRoom(params.id);
	if (!existing) return json({ error: 'room not found' }, { status: 404 });
	const fields = await request.json();
	const room = updateRoom(params.id, fields);
	return json({ room });
}

export function DELETE({ params }) {
	const existing = getRoom(params.id);
	if (!existing) return json({ error: 'room not found' }, { status: 404 });
	deleteRoom(params.id);
	return json({ ok: true });
}
