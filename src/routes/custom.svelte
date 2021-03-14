<script>
    import { onMount } from "svelte";
    import Chart from "chart.js";

    let jql = '"Epic Link" = CAR-38718';
    let analyze = 13;
    let data;
    let email;
    let token;

    onMount(() => {
        const url = new URL(window.location.href);
        email = url.searchParams.get("email");
        token = url.searchParams.get("token");
    });

    function settingsChanged() {
        const url = new URL(window.location.href);
        url.searchParams.set("email", email);
        url.searchParams.set("token", token);
        window.history.pushState(null, null, url);
    }

    let promise = null;
    async function loadData() {
        data = null;
        const url =
            "customApi?" +
            new URLSearchParams({
                jql: encodeURIComponent(jql),
                analyze: analyze,
            });
        promise = fetch(url);
        const res = await promise;
        data = await res.json();
    }

    function renderChart(node) {
        let ctx = node;
        let chart;

        return {
            update(data) {
                if (!data || data.error) {
                    return;
                }
                chart = new Chart(ctx, {
                    type: "bar",
                    data: {
                        datasets: [
                            {
                                label: "new",
                                data: data.datasets.new,
                                backgroundColor: "#ffe0e6",
                                borderColor: "#ff7c98",
                                borderWidth: "1",
                            },
                            {
                                label: "done",
                                data: data.datasets.done,
                                backgroundColor: "#dbf2f2",
                                borderColor: "#68caca",
                                borderWidth: "1",
                            },
                            {
                                label: "todo",
                                data: data.datasets.todo,
                                type: "line",
                                fill: false,
                                backgroundColor: "#d7ecfb",
                                borderColor: "#d4ebfb",
                            },
                            {
                                label: "20% confidence",
                                data: data.datasets.twenty,
                                borderDash: [3, 3],
                                type: "line",
                                fill: false,
                                backgroundColor: "#ebe0ff",
                                borderColor: "#b088ff",
                            },
                            {
                                label: "50% confidence",
                                data: data.datasets.fifty,
                                borderDash: [3, 3],
                                type: "line",
                                fill: false,
                                backgroundColor: "#ebe0ff",
                                borderColor: "#b088ff",
                            },
                            {
                                label: "80% confidence",
                                data: data.datasets.heighty,
                                borderDash: [3, 3],
                                type: "line",
                                fill: false,
                                backgroundColor: "#ebe0ff",
                                borderColor: "#b088ff",
                            },
                        ],
                    },
                    options: {
                        title: {
                            display: true,
                            text: "Title",
                        },
                        scales: {
                            xAxes: [
                                {
                                    type: "time",
                                    time: {
                                        unit: "week",
                                        isoWeekday: true,
                                        displayFormats: {
                                            week: "D MMM YYYY",
                                        },
                                    },
                                },
                            ],
                            yAxes: [
                                {
                                    ticks: {
                                        beginAtZero: true,
                                        precision: 0,
                                        suggestedMax: 3,
                                    },
                                },
                            ],
                        },
                    },
                });
            },
            destroy() {
                if (chart) {
                    chart.destroy();
                }
            },
        };
    }
</script>

<section>
    <aside>
        <details>
            <summary><small>Paramètres</small></summary>
            <p>
                <input
                    type="text"
                    bind:value={email}
                    placeholder="Your email..."
                    on:change={settingsChanged}
                />
                <input
                    type="text"
                    bind:value={token}
                    placeholder="Jira token..."
                    on:change={settingsChanged}
                />
            </p>
            <hr />
        </details>
        <p>
            <input
                type="text"
                placeholder="JQL..."
                bind:value={jql}
                on:change={loadData}
            />
            {#if data && data.error}
                <samp>{data.error}</samp>
            {/if}
            <small
                >"Product Line" in ("Perf & Comp", "Talent Review", "Talent
                Management > Career") AND project = CAR AND resolved > "-180d"
                <br />
                CC => "Epic Link" in (CC-2305, CC-2315, CC-1406, CC-2223, CC-2374)
                <br />
                NewForm => "Epic Link" in (CAR-47157, CAR-55744, CAR-38718, CAR-44713,CAR-54459,
                CAR-51141)
                <br />
                trse => "Epic Link" in (TRSE-44, TRSE-7, TRSE-153, TRSE-217, TRSE-225)</small
            >
            <br />
            <span>
                Analyze on last
                <input
                    type="number"
                    bind:value={analyze}
                    min="2"
                    on:change={loadData}
                />
                weeks</span
            >
        </p>
    </aside>
</section>
<section id="content">
    <aside>
        {#await promise}
            <p>Loading...</p>
        {:then}
            <canvas use:renderChart={data} id="chart" width="5" height="2" />
        {/await}
    </aside>
</section>

<style>
    aside {
        width: 100%;
    }

    details {
        margin: 0;
    }

    input[type="text"] {
        width: 100%;
    }

    input[type="number"] {
        width: 50px;
        display: inline-block;
    }

    samp {
        border: 1px solid #ff7c98;
        background-color: #ffe0e6;
    }
</style>
