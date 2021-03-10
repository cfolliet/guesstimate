<script>
    export let segment;
</script>

<header>
    <nav>
        <a href="."><img src="" alt="Guesstimate" /></a>
        <ul>
            <li>
                <a
                    aria-current={segment === undefined ? "page" : undefined}
                    href="/">Split by Epics</a
                >
            </li>
            <li>
                <a
                    aria-current={segment === "custom" ? "page" : undefined}
                    href="custom">Custom</a
                >
            </li>
        </ul>
    </nav>
</header>

<style>
    nav {
        margin-bottom: 0;
    }
</style>
