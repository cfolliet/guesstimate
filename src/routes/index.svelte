<script context="module">
	export async function preload(page, session) {
		const { slug } = page.params;

		const res = await this.fetch(`process`);
		const data = await res.json();

		return { data };
	}
</script>

<script>
	import Epic from "../components/Epic.svelte";
	export let data;
</script>

<svelte:head>
	<title>Guesstimate</title>
	<link rel="stylesheet" href="https://unpkg.com/mvp.css" />
</svelte:head>

<h1>Guesstimate</h1>
{#each data as epic}
	<Epic data={epic} />
{/each}
