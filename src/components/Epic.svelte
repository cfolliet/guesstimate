<script>
	import PastChart from "../components/PastChart.svelte";
	import FutureChart from "../components/FutureChart.svelte";
	export let data;
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
			<PastChart
				id={"past" + data.epic}
				data={Object.entries(data.past).map(([week, issues]) => {
					return { x: week, y: issues.length };
				})}
			/>
			<FutureChart
				id={"future" + data.epic}
				data={!data.future
					? []
					: data.future.reduce(
							(acc, value) => {
								if (
									acc.cumulative[acc.cumulative.length - 1] &&
									acc.cumulative[acc.cumulative.length - 1]
										.y >= 99
								) {
									return acc;
								}
								acc.percent.push(value);
								const lastCumulative = acc.cumulative[
									acc.cumulative.length - 1
								]
									? acc.cumulative[acc.cumulative.length - 1]
											.y
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
