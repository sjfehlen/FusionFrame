import { json } from '@sveltejs/kit';
import { getWholeHomeItem, updateWholeHomeItem } from '$lib/server/wholeHomeItems.js';
import { parseJsonBody, mutate } from '$lib/server/apiHelpers.js';

export function GET({ params }) {
	const item = getWholeHomeItem(params.id);
	if (!item) return json({ error: 'whole-home item not found' }, { status: 404 });
	return json({ whole_home_item: item });
}

export async function PATCH({ params, request }) {
	const existing = getWholeHomeItem(params.id);
	if (!existing) return json({ error: 'whole-home item not found' }, { status: 404 });

	const parsed = await parseJsonBody(request);
	if (parsed.error) return json({ error: parsed.error }, { status: 400 });

	// updateWholeHomeItem enforces the whole-home category scope invariant and
	// rejects unbindable values; mutate() turns a throw into a 400.
	return mutate(
		() => updateWholeHomeItem(params.id, parsed.body),
		(item) => ({ whole_home_item: item })
	);
}
