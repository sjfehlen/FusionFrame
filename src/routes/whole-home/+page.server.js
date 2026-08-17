import { listWholeHomeItems, createWholeHomeItem } from '$lib/server/wholeHomeItems.js';
import { db } from '$lib/server/db.js';
import { fail, redirect } from '@sveltejs/kit';

export function load() {
	const items = listWholeHomeItems();
	const categories = db.prepare("SELECT * FROM categories WHERE scope = 'whole_home' ORDER BY sort_order").all();
	return { items, categories };
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name');
		if (!name || !String(name).trim()) {
			return fail(400, { error: 'name is required' });
		}
		let item;
		try {
			item = createWholeHomeItem({
				name,
				category_id: Number(form.get('category_id')),
				notes: form.get('notes') || ''
			});
		} catch (err) {
			return fail(400, { error: err.message });
		}
		redirect(303, `/whole-home/${item.id}`);
	}
};
