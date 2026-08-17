<script>
	let { data } = $props();
</script>

<h1>Purchases</h1>

<table>
	<thead>
		<tr>
			<th>Item</th>
			<th>Vendor</th>
			<th>Price</th>
			<th>Status</th>
		</tr>
	</thead>
	<tbody>
		{#each data.purchases as purchase}
			<tr>
				<td>{purchase.item}</td>
				<td>{purchase.vendor}</td>
				<td>{purchase.price ?? ''}</td>
				<td>{purchase.status}</td>
			</tr>
		{/each}
	</tbody>
</table>

<h2>Log a purchase</h2>
<form method="POST" action="?/create">
	<label>Item <input name="item" required /></label>
	<label>Vendor <input name="vendor" /></label>
	<label>Price <input name="price" type="number" step="0.01" /></label>
	<label>
		Status
		<select name="status">
			<option value="researching">Researching</option>
			<option value="considering">Considering</option>
			<option value="purchased">Purchased</option>
			<option value="installed">Installed</option>
		</select>
	</label>
	<label>Link <input name="link" type="url" /></label>
	<label>
		Belongs to
		<select name="target" required>
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
	<button type="submit">Log purchase</button>
</form>
