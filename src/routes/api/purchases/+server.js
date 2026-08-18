import { json } from '@sveltejs/kit';
import { createPurchase, listPurchases } from '$lib/server/purchases.js';
import { parseJsonBody, mutate } from '$lib/server/apiHelpers.js';

export function GET() {
	return json({ purchases: listPurchases() });
}

export async function POST({ request }) {
	const parsed = await parseJsonBody(request);
	if (parsed.error) return json({ error: parsed.error }, { status: 400 });
	const fields = parsed.body;

	if (!fields.item) return json({ error: 'item is required' }, { status: 400 });
	return mutate(
		() => createPurchase(fields),
		(purchase) => ({ purchase }),
		201
	);
}
