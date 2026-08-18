<script>
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<div class="flex min-h-screen">
	<Sidebar current={page.url.pathname} />
	<main class="flex-1 px-8 py-10">
		<div class="mx-auto max-w-4xl">
			{@render children()}
		</div>
	</main>
</div>
