<script>
	let { roomId, item } = $props();

	const STATUSES = ['considering', 'chosen', 'rejected'];
	const STYLES = {
		considering: 'bg-warning-soft text-warning border-warning/30',
		chosen: 'bg-accent-soft text-accent border-accent/30',
		rejected: 'bg-danger-soft text-danger border-danger/30'
	};

	let status = $state(item.status);
	let saving = $state(false);

	async function cycle() {
		const next = STATUSES[(STATUSES.indexOf(status) + 1) % STATUSES.length];
		const prev = status;
		status = next;
		saving = true;
		try {
			const res = await fetch(`/api/rooms/${roomId}/checklist/${item.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: next })
			});
			if (!res.ok) status = prev;
		} catch {
			status = prev;
		} finally {
			saving = false;
		}
	}
</script>

<button
	type="button"
	onclick={cycle}
	disabled={saving}
	class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize transition disabled:opacity-50 {STYLES[
		status
	]}"
	title="Click to change status"
>
	{status}
</button>
