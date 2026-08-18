import { json } from '@sveltejs/kit';

/** Self-documenting index so an AI agent can discover the surface with one GET. */
export function GET() {
	return json({
		name: 'FusionFrame API',
		description:
			'Plan a future home build/renovation: room and whole-home-item tech/finish decisions, ' +
			'network line-drop estimates, and purchases. Auth is not implemented in v1 — deploy this ' +
			'behind your own reverse proxy or VPN if exposing it beyond localhost.',
		endpoints: [
			{ method: 'GET', path: '/api/rooms', description: 'List all rooms with their room type label.' },
			{ method: 'POST', path: '/api/rooms', description: 'Create a room. Body: {"name": string, "room_type_id"?: number, ...physical attributes}. Setting room_type_id materializes that type\'s default categories and checklist items.' },
			{ method: 'GET', path: '/api/rooms/{id}', description: 'One room with its categories, checklist, and network endpoints.' },
			{ method: 'PATCH', path: '/api/rooms/{id}', description: 'Update a room\'s physical attributes or name.' },
			{ method: 'DELETE', path: '/api/rooms/{id}', description: 'Delete a room and everything under it.' },
			{ method: 'GET', path: '/api/rooms/{id}/network-summary', description: 'Computed drop count, estimated cable footage, and whether the run exceeds the 328ft practical Ethernet limit.' },
			{ method: 'POST', path: '/api/rooms/{id}/research', description: 'Write a research finding to a room. Body: {"category_id"?: number, "body": string, "sources"?: string}. This is the primary AI-write target for research.' },
			{ method: 'GET', path: '/api/whole-home-items', description: 'List whole-home items (networking, electrical, HVAC, etc.) with category label joined in.' },
			{ method: 'POST', path: '/api/whole-home-items', description: 'Create a whole-home item. Body: {"category_id": number, "name": string, "notes"?: string}.' },
			{ method: 'GET', path: '/api/whole-home-items/{id}', description: 'One whole-home item.' },
			{ method: 'PATCH', path: '/api/whole-home-items/{id}', description: 'Update a whole-home item.' },
			{ method: 'POST', path: '/api/whole-home-items/{id}/research', description: 'Write a research finding to a whole-home item. Same body shape as the room research endpoint.' },
			{ method: 'GET', path: '/api/categories', description: 'List categories. Filter with ?scope=room or ?scope=whole_home.' },
			{ method: 'GET', path: '/api/room-types', description: 'List room types with their default categories and checklist items.' },
			{ method: 'GET', path: '/api/purchases', description: 'List all purchases.' },
			{ method: 'POST', path: '/api/purchases', description: 'Log a purchase candidate. Body: {"item": string, "vendor"?: string, "price"?: number, "status"?: "researching"|"considering"|"purchased"|"installed", "link"?: string, "room_id" or "whole_home_item_id": number (exactly one required)}.' }
		]
	});
}
