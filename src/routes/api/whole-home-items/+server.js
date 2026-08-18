import { json } from '@sveltejs/kit';
import { createWholeHomeItem, listWholeHomeItems } from '$lib/server/wholeHomeItems.js';
import { parseJsonBody, mutate } from '$lib/server/apiHelpers.js';

export function GET() {
	return json({ whole_home_items: listWholeHomeItems() });
}

export async function POST({ request }) {
	const parsed = await parseJsonBody(request);
	if (parsed.error) return json({ error: parsed.error }, { status: 400 });
	const fields = parsed.body;

	if (!fields.name || !fields.category_id) {
		return json({ error: 'name and category_id are required' }, { status: 400 });
	}
	return mutate(
		() => createWholeHomeItem(fields),
		(item) => ({ whole_home_item: item }),
		201
	);
}
