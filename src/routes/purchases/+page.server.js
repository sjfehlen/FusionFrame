import { listPurchases, createPurchase } from '$lib/server/purchases.js';
import { listRooms } from '$lib/server/rooms.js';
import { listWholeHomeItems } from '$lib/server/wholeHomeItems.js';
import { fail } from '@sveltejs/kit';
import { readFormString, readFormNumber } from '$lib/server/apiHelpers.js';

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

		// Every field is read through readFormString/readFormNumber, which
		// reject non-string values (form.get() returns a File for a
		// file-typed field) before they can reach the SQLite binder.
		const read = {};
		for (const [key, opts] of [
			['target', { required: true }],
			['item', { required: true }],
			['status', {}],
			['vendor', {}],
			['link', {}]
		]) {
			const result = readFormString(form, key, opts);
			if (result.error) return fail(400, { error: result.error });
			read[key] = result.value;
		}

		if (!/^(room|whole_home_item):\d+$/.test(read.target)) {
			return fail(400, { error: 'target must be in the form "room:<id>" or "whole_home_item:<id>"' });
		}
		const [kind, id] = read.target.split(':');

		const VALID_STATUSES = ['researching', 'considering', 'purchased', 'installed'];
		const status = read.status || 'researching';
		if (!VALID_STATUSES.includes(status)) {
			return fail(400, { error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
		}

		const price = readFormNumber(form, 'price');
		if (price.error) return fail(400, { error: price.error });

		const fields = {
			item: read.item,
			vendor: read.vendor || '',
			price: price.value,
			status,
			link: read.link || ''
		};
		if (kind === 'room') fields.room_id = Number(id);
		if (kind === 'whole_home_item') fields.whole_home_item_id = Number(id);

		try {
			createPurchase(fields);
		} catch (err) {
			return fail(400, { error: err.message });
		}
		return { success: true };
	}
};
