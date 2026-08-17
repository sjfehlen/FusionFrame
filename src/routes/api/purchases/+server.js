import { json } from '@sveltejs/kit';
import { createPurchase, listPurchases } from '$lib/server/purchases.js';

export function GET() {
	return json({ purchases: listPurchases() });
}

export async function POST({ request }) {
	const fields = await request.json();
	if (!fields.item) return json({ error: 'item is required' }, { status: 400 });
	try {
		const purchase = createPurchase(fields);
		return json({ purchase }, { status: 201 });
	} catch (err) {
		return json({ error: err.message }, { status: 400 });
	}
}
