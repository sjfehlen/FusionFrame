<script>
	import ChecklistChip from '$lib/components/ui/ChecklistChip.svelte';

	let { data } = $props();
	const { room } = data;

	const fields = [
		{ key: 'sqft', label: 'Square footage', type: 'number' },
		{ key: 'ceiling_height_in', label: 'Ceiling height (in)', type: 'number' },
		{ key: 'floor_level', label: 'Floor level', type: 'number' },
		{ key: 'distance_from_closet_ft', label: 'Distance from wiring closet (ft)', type: 'number' },
		{ key: 'exterior_wall_count', label: 'Exterior wall count', type: 'number' },
		{ key: 'window_count', label: 'Window count', type: 'number' },
		{ key: 'window_type', label: 'Window type', type: 'text' },
		{ key: 'compass_orientation', label: 'Compass orientation', type: 'text' },
		{ key: 'flooring_type', label: 'Flooring type', type: 'text' },
		{ key: 'paint_color', label: 'Paint color', type: 'text' }
	];
</script>

<div class="flex items-baseline gap-3">
	<h1 class="text-2xl font-bold text-fg">{room.name}</h1>
	{#if room.room_type_label}
		<span class="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
			{room.room_type_label}
		</span>
	{/if}
</div>

<h2 class="mt-8 text-lg font-semibold text-fg">Physical attributes</h2>
<form
	method="POST"
	action="?/updateAttributes"
	class="mt-4 rounded-xl border border-border bg-surface p-5"
>
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each fields as f}
			<label class="flex flex-col gap-1 text-sm font-medium text-fg">
				{f.label}
				<input
					name={f.key}
					type={f.type}
					value={room[f.key] ?? ''}
					class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</label>
		{/each}
	</div>
	<label class="mt-4 flex flex-col gap-1 text-sm font-medium text-fg">
		Accessibility notes
		<textarea
			name="accessibility_notes"
			rows="3"
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			>{room.accessibility_notes ?? ''}</textarea
		>
	</label>
	<button
		type="submit"
		class="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90"
	>
		Save
	</button>
</form>

<h2 class="mt-8 text-lg font-semibold text-fg">Categories</h2>
{#if room.categories.length === 0}
	<p class="mt-2 text-sm text-muted">No categories yet.</p>
{:else}
	<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
		{#each room.categories as category}
			<div class="rounded-lg border border-border bg-surface p-4">
				<div class="font-medium text-fg">{category.label}</div>
				{#if category.notes}
					<p class="mt-1 text-sm text-muted">{category.notes}</p>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<h2 class="mt-8 text-lg font-semibold text-fg">Checklist</h2>
{#if room.checklist.length === 0}
	<p class="mt-2 text-sm text-muted">No checklist items yet.</p>
{:else}
	<div class="mt-4 flex flex-col gap-2">
		{#each room.checklist as item}
			<div
				class="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
			>
				<span class="text-sm font-medium text-fg">{item.label}</span>
				<ChecklistChip roomId={room.id} {item} />
			</div>
		{/each}
	</div>
{/if}

<h2 class="mt-8 text-lg font-semibold text-fg">Network endpoints</h2>
{#if room.network_endpoints.length === 0}
	<p class="mt-2 text-sm text-muted">No wired endpoints logged yet.</p>
{:else}
	<div class="mt-4 flex flex-col gap-2">
		{#each room.network_endpoints as endpoint}
			<div class="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg">
				{endpoint.device_name} ({endpoint.device_type})
				{#if endpoint.needs_poe}
					<span class="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent"
						>PoE</span
					>
				{/if}
			</div>
		{/each}
	</div>
{/if}
