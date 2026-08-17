import { db } from './db.js';

export function createWholeHomeItem({ category_id, name, notes = '' }) {
	const category = db
		.prepare("SELECT id FROM categories WHERE id = ? AND scope = 'whole_home'")
		.get(category_id);
	if (!category) {
		throw new Error('category_id must reference a whole_home-scoped category');
	}

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
	const columns = ['category_id', 'name', 'notes'].filter((c) => fields[c] !== undefined);
	if (columns.length === 0) return getWholeHomeItem(id);

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
