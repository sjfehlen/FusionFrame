import { json } from '@sveltejs/kit';
import { createResearchNote } from '$lib/server/research.js';
import { getWholeHomeItem } from '$lib/server/wholeHomeItems.js';
import { parseJsonBody, mutate } from '$lib/server/apiHelpers.js';

export async function POST({ params, request }) {
	const item = getWholeHomeItem(params.id);
	if (!item) return json({ error: 'whole-home item not found' }, { status: 404 });

	const parsed = await parseJsonBody(request);
	if (parsed.error) return json({ error: parsed.error }, { status: 400 });
	const { category_id, body, sources } = parsed.body;

	if (!body) return json({ error: 'body is required' }, { status: 400 });

	return mutate(
		() => createResearchNote({ whole_home_item_id: params.id, category_id, body, sources }),
		(note) => ({ research_note: note }),
		201
	);
}
