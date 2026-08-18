import { json } from '@sveltejs/kit';
import { getRoom } from '$lib/server/rooms.js';
import { computeNetworkSummary } from '$lib/server/networkSummary.js';

export function GET({ params }) {
	const room = getRoom(params.id);
	if (!room) return json({ error: 'room not found' }, { status: 404 });

	const summary = computeNetworkSummary({
		endpointCount: room.network_endpoints.length,
		distanceFromClosetFt: room.distance_from_closet_ft
	});

	return json({ room_id: room.id, endpoints: room.network_endpoints, ...summary });
}
