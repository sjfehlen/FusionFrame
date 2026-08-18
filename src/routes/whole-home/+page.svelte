<script>
	import Card from '$lib/components/ui/Card.svelte';

	let { data } = $props();
</script>

<h1 class="text-2xl font-bold text-fg">Whole-Home Items</h1>

<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
	{#each data.items as item}
		<Card href="/whole-home/{item.id}">
			<div class="font-semibold text-fg">{item.name}</div>
			<span
				class="mt-2 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent"
			>
				{item.category_label}
			</span>
		</Card>
	{:else}
		<p class="text-muted">No whole-home items yet — add one below.</p>
	{/each}
</div>

<h2 class="mt-10 text-lg font-semibold text-fg">Add a whole-home item</h2>
<form
	method="POST"
	action="?/create"
	class="mt-4 flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:flex-wrap sm:items-end"
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
		Category
		<select
			name="category_id"
			required
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		>
			{#each data.categories as category}
				<option value={category.id}>{category.label}</option>
			{/each}
		</select>
	</label>
	<label class="flex flex-1 flex-col gap-1 text-sm font-medium text-fg">
		Notes
		<textarea
			name="notes"
			rows="1"
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		></textarea>
	</label>
	<button
		type="submit"
		class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90"
	>
		Create item
	</button>
</form>
