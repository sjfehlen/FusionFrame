import { json } from '@sveltejs/kit';
import { getChecklistItem, updateChecklistItem } from '$lib/server/rooms.js';
import { parseJsonBody, mutate } from '$lib/server/apiHelpers.js';

export async function PATCH({ params, request }) {
	const existing = getChecklistItem(params.id, params.itemId);
	if (!existing) return json({ error: 'checklist item not found' }, { status: 404 });

	const parsed = await parseJsonBody(request);
	if (parsed.error) return json({ error: parsed.error }, { status: 400 });

	return mutate(
		() => updateChecklistItem(params.id, params.itemId, parsed.body),
		(item) => ({ item })
	);
}
