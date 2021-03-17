<script>
	import Nav from "../components/Nav.svelte";
</script>

<svelte:head>
	<title>Guesstimate</title>
	<link rel="stylesheet" href="https://unpkg.com/mvp.css" />
</svelte:head>

<Nav />

<main>
	<slot />
</main>
