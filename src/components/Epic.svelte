<script>
	import PastChart from "../components/PastChart.svelte";
	import FutureChart from "../components/FutureChart.svelte";
	export let data;

	let hasPastData = false;
	const pastChartData = {
		done: Object.entries(data.past).map(([week, issues]) => {
			if (issues.length) {
				hasPastData = true;
			}
			return { x: week, y: issues.length };
		}),
		new: Object.entries(data.new).map(([week, issues]) => {
			if (issues.length) {
				hasPastData = true;
			}
			return { x: week, y: issues.length };
		}),
	};

	let bestFinish = null;
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

					let newCumulative = value.y + lastCumulative;
					if (bestFinish == null && newCumulative >= 80) {
						bestFinish = value.x;
					}
					acc.cumulative.push({
						x: value.x,
						y: newCumulative,
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
			{#if data.epic != "null"}
				Epic: {data.summary} <sup>{data.epic}</sup>
			{:else}
				Sans Epic
			{/if}
		</h3>
		<small
			>Reste à faire: {data.unresolved} stories | Date de fin estimée: {bestFinish
				? new Intl.DateTimeFormat("fr-FR", {
						year: "numeric",
						month: "long",
						day: "numeric",
				  }).format(new Date(bestFinish))
				: "aucune"}</small
		>
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
