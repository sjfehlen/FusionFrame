import { getWholeHomeItem, updateWholeHomeItem } from '$lib/server/wholeHomeItems.js';
import { error, fail } from '@sveltejs/kit';
import { readFormString } from '$lib/server/apiHelpers.js';

export function load({ params }) {
	const item = getWholeHomeItem(params.id);
	if (!item) error(404, 'Whole-home item not found');
	return { item };
}

export const actions = {
	updateNotes: async ({ params, request }) => {
		const form = await request.formData();
		const notes = readFormString(form, 'notes', { trim: false });
		if (notes.error) return fail(400, { error: notes.error });
		try {
			updateWholeHomeItem(params.id, { notes: notes.value ?? '' });
		} catch (err) {
			return fail(400, { error: err.message });
		}
		return { success: true };
	}
};
