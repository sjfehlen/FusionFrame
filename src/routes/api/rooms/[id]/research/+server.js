import { json } from '@sveltejs/kit';
import { createResearchNote } from '$lib/server/research.js';
import { getRoom } from '$lib/server/rooms.js';
import { parseJsonBody, mutate } from '$lib/server/apiHelpers.js';

export async function POST({ params, request }) {
	const room = getRoom(params.id);
	if (!room) return json({ error: 'room not found' }, { status: 404 });

	const parsed = await parseJsonBody(request);
	if (parsed.error) return json({ error: parsed.error }, { status: 400 });
	const { category_id, body, sources } = parsed.body;

	if (!body) return json({ error: 'body is required' }, { status: 400 });

	return mutate(
		() => createResearchNote({ room_id: params.id, category_id, body, sources }),
		(note) => ({ research_note: note }),
		201
	);
}
