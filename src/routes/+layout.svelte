<script>
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<div style="display: flex;">
	<Sidebar current={page.url.pathname} />
	<main style="flex: 1; padding: 2rem; max-width: 900px;">
		{@render children()}
	</main>
</div>
