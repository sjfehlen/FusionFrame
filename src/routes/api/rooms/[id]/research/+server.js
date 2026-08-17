import { json } from '@sveltejs/kit';
import { createResearchNote } from '$lib/server/research.js';
import { getRoom } from '$lib/server/rooms.js';

export async function POST({ params, request }) {
	const room = getRoom(params.id);
	if (!room) return json({ error: 'room not found' }, { status: 404 });

	const { category_id, body, sources } = await request.json();
	if (!body) return json({ error: 'body is required' }, { status: 400 });

	const note = createResearchNote({ room_id: params.id, category_id, body, sources });
	return json({ research_note: note }, { status: 201 });
}
