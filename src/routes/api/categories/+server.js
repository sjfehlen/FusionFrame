import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';

export function GET({ url }) {
	const scope = url.searchParams.get('scope');
	const categories = scope
		? db.prepare('SELECT * FROM categories WHERE scope = ? ORDER BY sort_order').all(scope)
		: db.prepare('SELECT * FROM categories ORDER BY scope, sort_order').all();
	return json({ categories });
}
