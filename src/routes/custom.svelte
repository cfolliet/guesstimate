<script>
    import { afterUpdate } from "svelte";
    import Chart from "chart.js";

    let jql = '"Epic Link" = CAR-38718';
    let analyze = 13;
    let data;

    let promise = null;

    async function submit() {
        const url =
            "customApi?" +
            new URLSearchParams({
                jql: encodeURIComponent(jql),
                analyze: analyze,
            });
        promise = fetch(url);
        const res = await promise;
        data = await res.json();
        renderChart();
        document.getElementById("content").scrollIntoView();
    }

    let ctx;
    let chart;

    function renderChart() {
        if (!data) {
            return;
        }

        ctx = document.getElementById("chart");
        if (chart) {
            chart.destroy();
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
    }

    afterUpdate(renderChart);
</script>

<section>
    <aside>
        <p>
            <input type="text" placeholder="JQL..." bind:value={jql} />
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
                    on:change={submit}
                />
                weeks</span
            >
            <br />
            <button on:click={submit}>Analyse</button>
        </p>
    </aside>
</section>
<section id="content">
    <aside>
        {#await promise}
            <p>Loading...</p>
        {:then}
            <canvas id="chart" width="5" height="2" />
        {/await}
    </aside>
</section>

<style>
    aside {
        width: 100%;
    }

    input[type="text"] {
        width: 100%;
    }

    input[type="number"] {
        width: 50px;
        display: inline-block;
    }
</style>
