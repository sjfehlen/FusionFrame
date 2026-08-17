import { listWholeHomeItems, createWholeHomeItem } from '$lib/server/wholeHomeItems.js';
import { db } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';

export function load() {
	const items = listWholeHomeItems();
	const categories = db.prepare("SELECT * FROM categories WHERE scope = 'whole_home' ORDER BY sort_order").all();
	return { items, categories };
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const item = createWholeHomeItem({
			name: form.get('name'),
			category_id: Number(form.get('category_id')),
			notes: form.get('notes') || ''
		});
		redirect(303, `/whole-home/${item.id}`);
	}
};
