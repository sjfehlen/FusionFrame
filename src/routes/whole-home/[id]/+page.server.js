import { getWholeHomeItem, updateWholeHomeItem } from '$lib/server/wholeHomeItems.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
	const item = getWholeHomeItem(params.id);
	if (!item) error(404, 'Whole-home item not found');
	return { item };
}

export const actions = {
	updateNotes: async ({ params, request }) => {
		const form = await request.formData();
		updateWholeHomeItem(params.id, { notes: form.get('notes') || '' });
		return { success: true };
	}
};
