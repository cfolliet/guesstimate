<script>
	import Nav from "../components/Nav.svelte";

	export let segment;
</script>

<svelte:head>
	<title>Guesstimate</title>
	<link rel="stylesheet" href="https://unpkg.com/mvp.css" />
</svelte:head>

<Nav {segment} />

<main>
	<slot />
</main>
