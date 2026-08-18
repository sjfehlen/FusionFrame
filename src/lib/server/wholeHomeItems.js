import { db } from './db.js';
import { assertBindable } from './apiHelpers.js';

const ITEM_COLUMNS = ['category_id', 'name', 'notes'];

function isNumericId(value) {
	if (typeof value === 'number') return Number.isFinite(value);
	if (typeof value === 'bigint') return true;
	return typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value));
}

/**
 * The whole-home scope invariant: a whole-home item may only be tagged with a
 * category whose scope is 'whole_home'. Both the create and the update path
 * call this, so the invariant cannot be bypassed through PATCH.
 */
export function assertWholeHomeCategory(category_id) {
	if (!isNumericId(category_id)) {
		throw new Error('category_id must be a number');
	}
	const category = db
		.prepare("SELECT id FROM categories WHERE id = ? AND scope = 'whole_home'")
		.get(category_id);
	if (!category) {
		throw new Error('category_id must reference a whole_home-scoped category');
	}
}

export function createWholeHomeItem({ category_id, name, notes = '' }) {
	assertWholeHomeCategory(category_id);
	assertBindable({ category_id, name, notes }, ITEM_COLUMNS);

	const { lastInsertRowid } = db
		.prepare('INSERT INTO whole_home_items (category_id, name, notes) VALUES (?, ?, ?)')
		.run(category_id, name, notes);
	return getWholeHomeItem(lastInsertRowid);
}

export function listWholeHomeItems() {
	return db
		.prepare(
			`SELECT whole_home_items.*, categories.label AS category_label, categories.key AS category_key
			 FROM whole_home_items
			 JOIN categories ON categories.id = whole_home_items.category_id
			 ORDER BY categories.sort_order, whole_home_items.name`
		)
		.all();
}

export function getWholeHomeItem(id) {
	return (
		db
			.prepare(
				`SELECT whole_home_items.*, categories.label AS category_label, categories.key AS category_key
				 FROM whole_home_items
				 JOIN categories ON categories.id = whole_home_items.category_id
				 WHERE whole_home_items.id = ?`
			)
			.get(id) ?? null
	);
}

export function updateWholeHomeItem(id, fields) {
	const columns = ITEM_COLUMNS.filter((c) => fields[c] !== undefined);
	if (columns.length === 0) return getWholeHomeItem(id);
	if (columns.includes('category_id')) assertWholeHomeCategory(fields.category_id);
	assertBindable(fields, columns);

	const assignments = columns.map((c) => `${c} = ?`).join(', ');
	const values = columns.map((c) => fields[c]);
	db.prepare(
		`UPDATE whole_home_items SET ${assignments}, updated_at = datetime('now') WHERE id = ?`
	).run(...values, id);

	return getWholeHomeItem(id);
}

export function deleteWholeHomeItem(id) {
	db.prepare('DELETE FROM whole_home_items WHERE id = ?').run(id);
}
