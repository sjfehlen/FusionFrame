import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('research notes', () => {
	let createResearchNote, listResearchNotes, createRoom;

	beforeAll(async () => {
		process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionframe-test-'));
		await import('../src/lib/server/db.js');
		({ createRoom } = await import('../src/lib/server/rooms.js'));
		({ createResearchNote, listResearchNotes } = await import('../src/lib/server/research.js'));
	});

	it('creates a research note attached to a room', () => {
		const room = createRoom({ name: 'Living Room' });
		const note = createResearchNote({
			room_id: room.id,
			body: 'Best in-ceiling speaker for a 12x14 room: Klipsch CDT-5650-C II',
			sources: 'https://example.com/review'
		});
		expect(note.room_id).toBe(room.id);
		expect(note.body).toContain('Klipsch');
	});

	it('rejects a note with neither room_id nor whole_home_item_id', () => {
		expect(() => createResearchNote({ body: 'orphan note' })).toThrow();
	});

	it('lists notes filtered by room_id', () => {
		const room = createRoom({ name: 'Bedroom' });
		createResearchNote({ room_id: room.id, body: 'note one' });
		createResearchNote({ room_id: room.id, body: 'note two' });
		const notes = listResearchNotes({ room_id: room.id });
		expect(notes).toHaveLength(2);
	});
});
