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

{#each data as epic}
	<Epic data={epic} />
{/each}
