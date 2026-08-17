<script>
	let { data } = $props();
	const { room } = data;
</script>

<h1>{room.name}</h1>
{#if room.room_type_label}<p><em>{room.room_type_label}</em></p>{/if}

<h2>Physical attributes</h2>
<form method="POST" action="?/updateAttributes">
	<label>Square footage <input name="sqft" type="number" value={room.sqft ?? ''} /></label>
	<label>Ceiling height (in) <input name="ceiling_height_in" type="number" value={room.ceiling_height_in ?? ''} /></label>
	<label>Floor level <input name="floor_level" type="number" value={room.floor_level ?? ''} /></label>
	<label>Distance from wiring closet (ft) <input name="distance_from_closet_ft" type="number" value={room.distance_from_closet_ft ?? ''} /></label>
	<label>Exterior wall count <input name="exterior_wall_count" type="number" value={room.exterior_wall_count ?? ''} /></label>
	<label>Window count <input name="window_count" type="number" value={room.window_count ?? ''} /></label>
	<label>Window type <input name="window_type" value={room.window_type ?? ''} /></label>
	<label>Compass orientation <input name="compass_orientation" value={room.compass_orientation ?? ''} /></label>
	<label>Flooring type <input name="flooring_type" value={room.flooring_type ?? ''} /></label>
	<label>Paint color <input name="paint_color" value={room.paint_color ?? ''} /></label>
	<label>Accessibility notes <textarea name="accessibility_notes">{room.accessibility_notes ?? ''}</textarea></label>
	<button type="submit">Save</button>
</form>

<h2>Categories</h2>
{#if room.categories.length === 0}
	<p>No categories yet.</p>
{:else}
	<ul>
		{#each room.categories as category}
			<li><strong>{category.label}</strong>{#if category.notes} — {category.notes}{/if}</li>
		{/each}
	</ul>
{/if}

<h2>Checklist</h2>
{#if room.checklist.length === 0}
	<p>No checklist items yet.</p>
{:else}
	<ul>
		{#each room.checklist as item}
			<li>{item.label} — <em>{item.status}</em></li>
		{/each}
	</ul>
{/if}

<h2>Network endpoints</h2>
{#if room.network_endpoints.length === 0}
	<p>No wired endpoints logged yet.</p>
{:else}
	<ul>
		{#each room.network_endpoints as endpoint}
			<li>{endpoint.device_name} ({endpoint.device_type}){#if endpoint.needs_poe} — PoE{/if}</li>
		{/each}
	</ul>
{/if}
