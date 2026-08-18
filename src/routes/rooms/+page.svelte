<script>
	let { data } = $props();
</script>

<h1>Rooms</h1>

<ul>
	{#each data.rooms as room}
		<li><a href="/rooms/{room.id}">{room.name}</a> {#if room.room_type_label}<span>— {room.room_type_label}</span>{/if}</li>
	{/each}
</ul>

<h2>Add a room</h2>
<form method="POST" action="?/create">
	<label>
		Name
		<input name="name" required />
	</label>
	<label>
		Room type
		<select name="room_type_id">
			<option value="">— none —</option>
			{#each data.roomTypes as rt}
				<option value={rt.id}>{rt.label}</option>
			{/each}
		</select>
	</label>
	<button type="submit">Create room</button>
</form>
