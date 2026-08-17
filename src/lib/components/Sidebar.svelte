<script>
	let { current = '' } = $props();

	const links = [
		{ href: '/rooms', label: 'Rooms' },
		{ href: '/whole-home', label: 'Whole-Home Items' },
		{ href: '/purchases', label: 'Purchases' }
	];
</script>

<nav class="sidebar">
	<div class="brand">FusionFrame</div>
	<ul>
		{#each links as link}
			<li>
				<a href={link.href} class:active={current.startsWith(link.href)}>{link.label}</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.sidebar {
		width: 220px;
		flex-shrink: 0;
		border-right: 1px solid var(--border);
		padding: 1.5rem 1rem;
		min-height: 100vh;
	}
	.brand {
		font-weight: 700;
		margin-bottom: 1.5rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	a {
		display: block;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		color: var(--fg);
		text-decoration: none;
	}
	a.active {
		background: var(--accent);
		color: white;
	}
</style>
