import { describe, it, expect } from 'vitest';
import { computeNetworkSummary } from '../src/lib/server/networkSummary.js';

describe('computeNetworkSummary', () => {
	it('adds the default spare margin of 1 to the endpoint count', () => {
		const result = computeNetworkSummary({ endpointCount: 3, distanceFromClosetFt: 40 });
		expect(result.dropCount).toBe(4);
	});

	it('respects a custom spare margin', () => {
		const result = computeNetworkSummary({ endpointCount: 3, distanceFromClosetFt: 40, spareMargin: 2 });
		expect(result.dropCount).toBe(5);
	});

	it('estimates total cable footage as dropCount * distance', () => {
		const result = computeNetworkSummary({ endpointCount: 3, distanceFromClosetFt: 40 });
		expect(result.estimatedCableFootage).toBe(4 * 40);
	});

	it('flags runs that exceed the 328ft (100m) practical Ethernet limit', () => {
		const short = computeNetworkSummary({ endpointCount: 1, distanceFromClosetFt: 100 });
		const long = computeNetworkSummary({ endpointCount: 1, distanceFromClosetFt: 400 });
		expect(short.exceedsRunLimit).toBe(false);
		expect(long.exceedsRunLimit).toBe(true);
		expect(long.runLimitFt).toBe(328);
	});

	it('treats a missing distance as unknown — no footage estimate, no limit flag', () => {
		const result = computeNetworkSummary({ endpointCount: 2 });
		expect(result.dropCount).toBe(3);
		expect(result.estimatedCableFootage).toBeNull();
		expect(result.exceedsRunLimit).toBeNull();
	});

	it('returns a zero drop count for a room with no endpoints and no spare margin override', () => {
		const result = computeNetworkSummary({ endpointCount: 0, distanceFromClosetFt: 20, spareMargin: 0 });
		expect(result.dropCount).toBe(0);
		expect(result.estimatedCableFootage).toBe(0);
	});
});
