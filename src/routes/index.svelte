<script context="module">
	export async function preload(page, session) {
		const { slug } = page.params;

		const res = await this.fetch(`process`);
		const data = await res.json();

		return { data };
	}
</script>

<script>
	export let data;
	//console.log(Object.entries(data[0].past));
</script>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<h1>Guesstimate</h1>
{#each data as epic}
	<h3>{epic.epic}</h3>
	{#each Object.entries(epic.past) as [week, issues]}
		<p>{week}: {issues.length} {issues[0] && issues[0].key}</p>
	{/each}
{/each}
