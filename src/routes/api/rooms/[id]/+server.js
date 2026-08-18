import { json } from '@sveltejs/kit';
import { getRoom, updateRoom, deleteRoom } from '$lib/server/rooms.js';
import { parseJsonBody, mutate } from '$lib/server/apiHelpers.js';

export function GET({ params }) {
	const room = getRoom(params.id);
	if (!room) return json({ error: 'room not found' }, { status: 404 });
	return json({ room });
}

export async function PATCH({ params, request }) {
	const existing = getRoom(params.id);
	if (!existing) return json({ error: 'room not found' }, { status: 404 });

	const parsed = await parseJsonBody(request);
	if (parsed.error) return json({ error: parsed.error }, { status: 400 });

	// updateRoom validates numeric/bindable fields and throws on bad input;
	// mutate() turns that into a 400 rather than an uncaught 500.
	return mutate(
		() => updateRoom(params.id, parsed.body),
		(room) => ({ room })
	);
}

export function DELETE({ params }) {
	const existing = getRoom(params.id);
	if (!existing) return json({ error: 'room not found' }, { status: 404 });
	deleteRoom(params.id);
	return json({ ok: true });
}
