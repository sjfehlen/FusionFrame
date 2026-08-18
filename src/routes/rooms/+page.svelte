<script>
	import Card from '$lib/components/ui/Card.svelte';

	let { data } = $props();
</script>

<h1 class="text-2xl font-bold text-fg">Rooms</h1>

<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
	{#each data.rooms as room}
		<Card href="/rooms/{room.id}">
			<div class="font-semibold text-fg">{room.name}</div>
			{#if room.room_type_label}
				<span
					class="mt-2 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent"
				>
					{room.room_type_label}
				</span>
			{/if}
		</Card>
	{:else}
		<p class="text-muted">No rooms yet — add one below.</p>
	{/each}
</div>

<h2 class="mt-10 text-lg font-semibold text-fg">Add a room</h2>
<form
	method="POST"
	action="?/create"
	class="mt-4 flex flex-wrap items-end gap-4 rounded-xl border border-border bg-surface p-5"
>
	<label class="flex flex-col gap-1 text-sm font-medium text-fg">
		Name
		<input
			name="name"
			required
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</label>
	<label class="flex flex-col gap-1 text-sm font-medium text-fg">
		Room type
		<select
			name="room_type_id"
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		>
			<option value="">— none —</option>
			{#each data.roomTypes as rt}
				<option value={rt.id}>{rt.label}</option>
			{/each}
		</select>
	</label>
	<button
		type="submit"
		class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90"
	>
		Create room
	</button>
</form>
