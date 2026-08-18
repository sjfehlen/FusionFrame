import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('rooms', () => {
	let db, createRoom, getRoom, listRooms, updateRoom, deleteRoom, updateChecklistItem;

	beforeAll(async () => {
		process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'fusionframe-test-'));
		({ db } = await import('../src/lib/server/db.js'));
		({ createRoom, getRoom, listRooms, updateRoom, deleteRoom, updateChecklistItem } = await import(
			'../src/lib/server/rooms.js'
		));
	});

	it('materializes the kitchen room type\'s default categories and checklist on creation', () => {
		const kitchenTypeId = db.prepare("SELECT id FROM room_types WHERE key = 'kitchen'").get().id;
		const room = createRoom({ name: 'Main Kitchen', room_type_id: kitchenTypeId, sqft: 220 });

		expect(room.name).toBe('Main Kitchen');
		expect(room.categories.map((c) => c.key).sort()).toEqual(['networking', 'non_tech']);
		expect(room.checklist.map((c) => c.label).sort()).toEqual(
			['Dishwasher', 'Garbage disposal', 'Range/oven', 'Refrigerator', 'Sink', 'Vent hood'].sort()
		);
		expect(room.checklist.every((c) => c.status === 'considering')).toBe(true);
	});

	it('creates a room with no room type and no materialized defaults', () => {
		const room = createRoom({ name: 'Mystery Room' });
		expect(room.categories).toEqual([]);
		expect(room.checklist).toEqual([]);
	});

	it('listRooms returns every created room with its room type label', () => {
		const rooms = listRooms();
		expect(rooms.some((r) => r.name === 'Main Kitchen' && r.room_type_label === 'Kitchen')).toBe(true);
	});

	it('updateRoom updates physical attributes without touching categories/checklist', () => {
		const room = createRoom({ name: 'Office' });
		const updated = updateRoom(room.id, { sqft: 150, paint_color: 'Sage Green' });
		expect(updated.sqft).toBe(150);
		expect(updated.paint_color).toBe('Sage Green');
	});

	it('updateAttributes action sets a physical attribute to null when submitted as an empty string', async () => {
		const { actions } = await import('../src/routes/rooms/[id]/+page.server.js');
		const room = createRoom({ name: 'Bedroom', paint_color: 'Sky Blue' });
		expect(room.paint_color).toBe('Sky Blue');

		const formData = new FormData();
		formData.set('paint_color', '');
		await actions.updateAttributes({
			params: { id: room.id },
			request: { formData: async () => formData }
		});

		expect(getRoom(room.id).paint_color).toBeNull();
	});

	it('updateChecklistItem changes status and rejects an invalid value', () => {
		const kitchenTypeId = db.prepare("SELECT id FROM room_types WHERE key = 'kitchen'").get().id;
		const room = createRoom({ name: 'Checklist Kitchen', room_type_id: kitchenTypeId });
		const item = room.checklist[0];
		expect(item.status).toBe('considering');

		const updated = updateChecklistItem(room.id, item.id, { status: 'chosen' });
		expect(updated.status).toBe('chosen');

		expect(() => updateChecklistItem(room.id, item.id, { status: 'not-a-status' })).toThrow();
	});

	it('deleteRoom removes the room and its materialized categories/checklist', () => {
		const kitchenTypeId = db.prepare("SELECT id FROM room_types WHERE key = 'kitchen'").get().id;
		const room = createRoom({ name: 'Temp Kitchen', room_type_id: kitchenTypeId });
		deleteRoom(room.id);
		expect(getRoom(room.id)).toBeNull();
		const orphanedChecklist = db.prepare('SELECT COUNT(*) AS n FROM checklist_items WHERE room_id = ?').get(room.id).n;
		expect(orphanedChecklist).toBe(0);
	});
});
