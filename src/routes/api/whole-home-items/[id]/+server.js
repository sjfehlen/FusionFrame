import { json } from '@sveltejs/kit';
import { getWholeHomeItem, updateWholeHomeItem } from '$lib/server/wholeHomeItems.js';

export function GET({ params }) {
	const item = getWholeHomeItem(params.id);
	if (!item) return json({ error: 'whole-home item not found' }, { status: 404 });
	return json({ whole_home_item: item });
}

export async function PATCH({ params, request }) {
	const existing = getWholeHomeItem(params.id);
	if (!existing) return json({ error: 'whole-home item not found' }, { status: 404 });
	const fields = await request.json();
	const item = updateWholeHomeItem(params.id, fields);
	return json({ whole_home_item: item });
}
