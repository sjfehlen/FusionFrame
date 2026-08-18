<script>
	let { data } = $props();
</script>

<h1>Whole-Home Items</h1>

<ul>
	{#each data.items as item}
		<li><a href="/whole-home/{item.id}">{item.name}</a> — <span>{item.category_label}</span></li>
	{/each}
</ul>

<h2>Add a whole-home item</h2>
<form method="POST" action="?/create">
	<label>
		Name
		<input name="name" required />
	</label>
	<label>
		Category
		<select name="category_id" required>
			{#each data.categories as category}
				<option value={category.id}>{category.label}</option>
			{/each}
		</select>
	</label>
	<label>
		Notes
		<textarea name="notes"></textarea>
	</label>
	<button type="submit">Create item</button>
</form>
