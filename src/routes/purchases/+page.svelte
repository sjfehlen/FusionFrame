<script>
	let { data } = $props();

	const STATUS_STYLES = {
		researching: 'bg-muted/10 text-muted border-border',
		considering: 'bg-warning-soft text-warning border-warning/30',
		purchased: 'bg-accent-soft text-accent border-accent/30',
		installed: 'bg-accent-soft text-accent border-accent/30'
	};
</script>

<h1 class="text-2xl font-bold text-fg">Purchases</h1>

<div class="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
	<table class="w-full text-left text-sm">
		<thead>
			<tr class="border-b border-border bg-bg text-xs font-semibold uppercase tracking-wide text-muted">
				<th class="px-4 py-3">Item</th>
				<th class="px-4 py-3">Vendor</th>
				<th class="px-4 py-3">Price</th>
				<th class="px-4 py-3">Status</th>
			</tr>
		</thead>
		<tbody>
			{#each data.purchases as purchase}
				<tr class="border-b border-border last:border-0">
					<td class="px-4 py-3 font-medium text-fg">{purchase.item}</td>
					<td class="px-4 py-3 text-muted">{purchase.vendor}</td>
					<td class="px-4 py-3 text-fg">{purchase.price != null ? `$${purchase.price}` : ''}</td>
					<td class="px-4 py-3">
						<span
							class="inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize {STATUS_STYLES[
								purchase.status
							] ?? 'border-border text-muted'}"
						>
							{purchase.status}
						</span>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="px-4 py-6 text-center text-muted">No purchases logged yet.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<h2 class="mt-10 text-lg font-semibold text-fg">Log a purchase</h2>
<form
	method="POST"
	action="?/create"
	class="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3"
>
	<label class="flex flex-col gap-1 text-sm font-medium text-fg">
		Item
		<input
			name="item"
			required
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</label>
	<label class="flex flex-col gap-1 text-sm font-medium text-fg">
		Vendor
		<input
			name="vendor"
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</label>
	<label class="flex flex-col gap-1 text-sm font-medium text-fg">
		Price
		<input
			name="price"
			type="number"
			step="0.01"
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</label>
	<label class="flex flex-col gap-1 text-sm font-medium text-fg">
		Status
		<select
			name="status"
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		>
			<option value="researching">Researching</option>
			<option value="considering">Considering</option>
			<option value="purchased">Purchased</option>
			<option value="installed">Installed</option>
		</select>
	</label>
	<label class="flex flex-col gap-1 text-sm font-medium text-fg">
		Link
		<input
			name="link"
			type="url"
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</label>
	<label class="flex flex-col gap-1 text-sm font-medium text-fg">
		Belongs to
		<select
			name="target"
			required
			class="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		>
			<optgroup label="Rooms">
				{#each data.rooms as room}
					<option value={`room:${room.id}`}>{room.name}</option>
				{/each}
			</optgroup>
			<optgroup label="Whole-Home Items">
				{#each data.wholeHomeItems as item}
					<option value={`whole_home_item:${item.id}`}>{item.name}</option>
				{/each}
			</optgroup>
		</select>
	</label>
	<div class="sm:col-span-2 lg:col-span-3">
		<button
			type="submit"
			class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90"
		>
			Log purchase
		</button>
	</div>
</form>
