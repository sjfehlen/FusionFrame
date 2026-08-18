<script>
	let { current = '' } = $props();

	const links = [
		{ href: '/rooms', label: 'Rooms', icon: '🛋️' },
		{ href: '/whole-home', label: 'Whole-Home Items', icon: '🏠' },
		{ href: '/purchases', label: 'Purchases', icon: '🧾' }
	];
</script>

<nav class="flex w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
	<div class="mb-8 px-2 text-lg font-bold tracking-tight text-fg">FusionFrame</div>
	<ul class="flex flex-col gap-1">
		{#each links as link}
			<li>
				<a
					href={link.href}
					class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition {current.startsWith(
						link.href
					)
						? 'bg-accent text-accent-fg'
						: 'text-fg/80 hover:bg-accent-soft hover:text-accent'}"
				>
					<span aria-hidden="true">{link.icon}</span>
					{link.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
