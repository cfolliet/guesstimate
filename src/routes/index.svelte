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
	import FutureChart from "../components/FutureChart.svelte";
	import Unresolved from "../components/Unresolved.svelte";
	export let data;
</script>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<h1>Guesstimate</h1>
{#each data as epic}
	<h3>{epic.epic}</h3>
	<main>
		<Unresolved count={epic.unresolved} />

		<PastChart
			id={"past" + epic.epic}
			data={Object.entries(epic.past).map(([week, issues]) => {
				return { x: week, y: issues.length };
			})}
		/>
		<FutureChart
			id={"future" + epic.epic}
			data={!epic.future
				? []
				: epic.future.reduce(
						(acc, value) => {
							acc.percent.push(value);
							const lastCumulative = acc.cumulative[
								acc.cumulative.length - 1
							]
								? acc.cumulative[acc.cumulative.length - 1].y
								: 0;

							acc.cumulative.push({
								x: value.x,
								y: value.y + lastCumulative,
							});
							return acc;
						},
						{
							percent: [],
							cumulative: [],
						}
				  )}
		/>
	</main>
{/each}
