import { json } from '@sveltejs/kit';
import { createResearchNote } from '$lib/server/research.js';
import { getWholeHomeItem } from '$lib/server/wholeHomeItems.js';

export async function POST({ params, request }) {
	const item = getWholeHomeItem(params.id);
	if (!item) return json({ error: 'whole-home item not found' }, { status: 404 });

	const { category_id, body, sources } = await request.json();
	if (!body) return json({ error: 'body is required' }, { status: 400 });

	const note = createResearchNote({ whole_home_item_id: params.id, category_id, body, sources });
	return json({ research_note: note }, { status: 201 });
}
