<script>
	import PastChart from "../components/PastChart.svelte";
	import FutureChart from "../components/FutureChart.svelte";
	export let data;

	let hasPastData = false;
	const pastChartData = Object.entries(data.past).map(([week, issues]) => {
		if (issues.length) {
			hasPastData = true;
		}
		return { x: week, y: issues.length };
	});

	const futureChartData = !data.future
		? []
		: data.future.reduce(
				(acc, value) => {
					if (
						acc.cumulative[acc.cumulative.length - 1] &&
						acc.cumulative[acc.cumulative.length - 1].y >= 99
					) {
						return acc;
					}
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
		  );
</script>

<section>
	<aside>
		<h3>
			{data.epic != "null"
				? "Epic: " + data.epic + " " + data.summary
				: "Sans Epic"}
		</h3>
		<small>Reste à faire: {data.unresolved} stories</small>
		<p>
			{#if hasPastData}
				<PastChart id={"past" + data.epic} data={pastChartData} />
				<FutureChart id={"future" + data.epic} data={futureChartData} />
			{:else}
				Aucun progrès en cours
			{/if}
		</p>
	</aside>
</section>

<style>
	aside {
		width: 100%;
	}
	aside p {
		display: flex;
	}
</style>
