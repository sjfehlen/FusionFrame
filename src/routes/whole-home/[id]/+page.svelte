<script>
	let { data } = $props();
	const { item } = data;
</script>

<h1>{item.name}</h1>
<p><em>{item.category_label}</em></p>

<form method="POST" action="?/updateNotes">
	<label>
		Notes
		<textarea name="notes">{item.notes}</textarea>
	</label>
	<button type="submit">Save</button>
</form>
