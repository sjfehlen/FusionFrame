const RUN_LIMIT_FT = 328; // ~100m practical Ethernet run limit before repeaters/media converters are needed

export function computeNetworkSummary({ endpointCount, distanceFromClosetFt, spareMargin = 1 }) {
	const dropCount = endpointCount + spareMargin;

	const hasDistance = distanceFromClosetFt !== undefined && distanceFromClosetFt !== null;

	return {
		dropCount,
		estimatedCableFootage: hasDistance ? dropCount * distanceFromClosetFt : null,
		runLimitFt: RUN_LIMIT_FT,
		exceedsRunLimit: hasDistance ? distanceFromClosetFt > RUN_LIMIT_FT : null
	};
}
