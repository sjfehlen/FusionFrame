<script>
	let { data } = $props();
	const { item } = data;
</script>

<div class="flex items-baseline gap-3">
	<h1 class="text-2xl font-bold text-fg">{item.name}</h1>
	<span class="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
		{item.category_label}
	</span>
</div>

<form
	method="POST"
	action="?/updateNotes"
	class="mt-6 rounded-xl border border-border bg-surface p-5"
>
	<label class="flex flex-col gap-1 text-sm font-medium text-fg">
		Notes
		<textarea
			name="notes"
			rows="6"
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			>{item.notes}</textarea
		>
	</label>
	<button
		type="submit"
		class="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90"
	>
		Save
	</button>
</form>
