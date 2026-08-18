<script>
	let { href = null, class: extra = '', children } = $props();
	const base =
		'block rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md hover:border-accent/40';
</script>

{#if href}
	<a {href} class="{base} {extra}">
		{@render children()}
	</a>
{:else}
	<div class="{base} {extra}">
		{@render children()}
	</div>
{/if}
