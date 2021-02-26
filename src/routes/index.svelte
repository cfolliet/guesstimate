<script context="module">
	export async function preload(page, session) {
		const { slug } = page.params;

		const res = await this.fetch(`process`);
		const data = await res.json();

		return { data };
	}
</script>

<script>
	import PastChart from "../components/PastChart.svelte";
	export let data;
</script>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<h1>Guesstimate</h1>
{#each data as epic}
	<h3>{epic.epic}</h3>
	<PastChart
		id={epic.epic}
		data={Object.entries(epic.past).map(([week, issues]) => {
			return { x: week, y: issues.length };
		})}
	/>
{/each}
