import { json } from '@sveltejs/kit';
import { createWholeHomeItem, listWholeHomeItems } from '$lib/server/wholeHomeItems.js';

export function GET() {
	return json({ whole_home_items: listWholeHomeItems() });
}

export async function POST({ request }) {
	const fields = await request.json();
	if (!fields.name || !fields.category_id) {
		return json({ error: 'name and category_id are required' }, { status: 400 });
	}
	try {
		const item = createWholeHomeItem(fields);
		return json({ whole_home_item: item }, { status: 201 });
	} catch (err) {
		return json({ error: err.message }, { status: 400 });
	}
}
