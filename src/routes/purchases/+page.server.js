import { listPurchases, createPurchase } from '$lib/server/purchases.js';
import { listRooms } from '$lib/server/rooms.js';
import { listWholeHomeItems } from '$lib/server/wholeHomeItems.js';

export function load() {
	return {
		purchases: listPurchases(),
		rooms: listRooms(),
		wholeHomeItems: listWholeHomeItems()
	};
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const target = form.get('target'); // "room:3" or "whole_home_item:2"
		const [kind, id] = target.split(':');

		const fields = {
			item: form.get('item'),
			vendor: form.get('vendor') || '',
			price: form.get('price') ? Number(form.get('price')) : null,
			status: form.get('status') || 'researching',
			link: form.get('link') || ''
		};
		if (kind === 'room') fields.room_id = Number(id);
		if (kind === 'whole_home_item') fields.whole_home_item_id = Number(id);

		createPurchase(fields);
		return { success: true };
	}
};
