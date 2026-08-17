/**
 * Shared input-validation helpers.
 *
 * Every path that takes external input (JSON API bodies, HTML form posts) and
 * turns it into a SQLite bind parameter must go through this module. The three
 * layers are:
 *
 *   1. `parseJsonBody`  — the request body is a JSON object at all.
 *   2. `readFormString` / `readFormNumber` — a form field is really a string
 *      (`FormData.get()` can return a `File`, which passes `!value` checks but
 *      is not bindable).
 *   3. `assertBindable` — last-resort guard called from the data-access layer,
 *      so no future caller can smuggle an unbindable value into a statement.
 *
 * Route handlers additionally wrap the data-access call in `mutate()`, which
 * turns any thrown error (CHECK / NOT NULL / FK violations, explicit invariant
 * errors) into a clean `{ error }` JSON response instead of an uncaught 500.
 */

import { json } from '@sveltejs/kit';

/**
 * Parse a request body that must be a JSON object.
 * @returns {Promise<{ body: Record<string, unknown> } | { error: string }>}
 */
export async function parseJsonBody(request) {
	let body;
	try {
		body = await request.json();
	} catch {
		return { error: 'invalid JSON body' };
	}
	if (body === null || typeof body !== 'object' || Array.isArray(body)) {
		return { error: 'request body must be a JSON object' };
	}
	return { body };
}

/**
 * Run a mutating data-access call and convert any thrown error into a 400 JSON
 * response. `wrap` shapes the success payload.
 */
export function mutate(fn, wrap, status = 200) {
	try {
		return json(wrap(fn()), { status });
	} catch (err) {
		return json({ error: err.message }, { status: 400 });
	}
}

/** Values better-sqlite3 can bind. Anything else must never reach a statement. */
export function isBindable(value) {
	return (
		value === null ||
		value === undefined ||
		typeof value === 'string' ||
		typeof value === 'number' ||
		typeof value === 'bigint' ||
		Buffer.isBuffer(value)
	);
}

/**
 * Guard called from the data-access layer. Throws a clean Error (which route
 * handlers turn into a 400) instead of letting the SQLite binder throw a raw
 * TypeError that nothing catches.
 */
export function assertBindable(fields, columns) {
	for (const column of columns) {
		const value = fields[column];
		if (!isBindable(value)) {
			throw new Error(`${column} must be a string, number, or null`);
		}
		if (typeof value === 'number' && !Number.isFinite(value)) {
			throw new Error(`${column} must be a finite number`);
		}
	}
}

/**
 * Read a form field as a string.
 * Returns `{ value: null }` when the field is absent, `{ error }` when the
 * field is present but not a string (e.g. a `File` from a multipart post).
 */
export function readFormString(form, key, { required = false, trim = true } = {}) {
	const raw = form.get(key);
	if (raw === null) {
		if (required) return { error: `${key} is required` };
		return { value: null };
	}
	if (typeof raw !== 'string') {
		return { error: `${key} must be a text value` };
	}
	const value = trim ? raw.trim() : raw;
	if (required && value === '') return { error: `${key} is required` };
	return { value };
}

/**
 * Read a form field as a number.
 * Absent or empty yields `{ value: null }`; anything non-numeric is an error.
 */
export function readFormNumber(form, key, { required = false } = {}) {
	const result = readFormString(form, key, { required });
	if (result.error) return result;
	if (result.value === null || result.value === '') {
		if (required) return { error: `${key} is required` };
		return { value: null };
	}
	const value = Number(result.value);
	if (!Number.isFinite(value)) {
		return { error: `${key} must be a number` };
	}
	return { value };
}

/**
 * Validate that already-parsed fields (JSON body or coerced form values) hold
 * finite numbers in the given columns. Used by the data-access layer so JSON
 * and form paths share one rule.
 */
export function assertNumericFields(fields, columns) {
	for (const column of columns) {
		const value = fields[column];
		if (value === undefined || value === null) continue;
		if (typeof value === 'number') {
			if (!Number.isFinite(value)) throw new Error(`${column} must be a number`);
			continue;
		}
		if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
			continue;
		}
		throw new Error(`${column} must be a number`);
	}
}
