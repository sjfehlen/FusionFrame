import { listWholeHomeItems, createWholeHomeItem } from '$lib/server/wholeHomeItems.js';
import { db } from '$lib/server/db.js';
import { fail, redirect } from '@sveltejs/kit';
import { readFormString, readFormNumber } from '$lib/server/apiHelpers.js';

export function load() {
	const items = listWholeHomeItems();
	const categories = db.prepare("SELECT * FROM categories WHERE scope = 'whole_home' ORDER BY sort_order").all();
	return { items, categories };
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();

		const name = readFormString(form, 'name', { required: true });
		if (name.error) return fail(400, { error: name.error });

		const categoryId = readFormNumber(form, 'category_id', { required: true });
		if (categoryId.error) return fail(400, { error: categoryId.error });

		const notes = readFormString(form, 'notes', { trim: false });
		if (notes.error) return fail(400, { error: notes.error });

		let item;
		try {
			item = createWholeHomeItem({
				name: name.value,
				category_id: categoryId.value,
				notes: notes.value ?? ''
			});
		} catch (err) {
			return fail(400, { error: err.message });
		}
		redirect(303, `/whole-home/${item.id}`);
	}
};
