<script>
    import { afterUpdate } from "svelte";
    import Chart from "chart.js";
    import { parseISO, isAfter, subWeeks } from "date-fns";

    let jql = '"Epic Link" = CAR-38718';
    let zoom = 13;
    let analyze = 13;
    let data;

    async function submit() {
        const url =
            "customApi?" +
            new URLSearchParams({
                jql: encodeURIComponent(jql),
                analyze: analyze,
            });
        const res = await fetch(url);
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
        const filteredData = JSON.parse(JSON.stringify(data));
        const date = subWeeks(new Date(), zoom);
        for (const datasetName in filteredData.datasets) {
            const newSet = filteredData.datasets[datasetName].filter((r) =>
                isAfter(parseISO(r.x), date)
            );
            filteredData.datasets[datasetName] = newSet;
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
                        data: filteredData.datasets.new,
                        backgroundColor: "#ffe0e6",
                        borderColor: "#ff7c98",
                        borderWidth: "1",
                    },
                    {
                        label: "done",
                        data: filteredData.datasets.done,
                        backgroundColor: "#dbf2f2",
                        borderColor: "#68caca",
                        borderWidth: "1",
                    },
                    {
                        label: "todo",
                        data: filteredData.datasets.todo,
                        type: "line",
                        fill: false,
                        backgroundColor: "#d7ecfb",
                        borderColor: "#d4ebfb",
                    },
                    {
                        label: "20% confidence",
                        data: filteredData.datasets.twenty,
                        borderDash: [3, 3],
                        type: "line",
                        fill: false,
                        backgroundColor: "#ebe0ff",
                        borderColor: "#b088ff",
                    },
                    {
                        label: "50% confidence",
                        data: filteredData.datasets.fifty,
                        borderDash: [3, 3],
                        type: "line",
                        fill: false,
                        backgroundColor: "#ebe0ff",
                        borderColor: "#b088ff",
                    },
                    {
                        label: "80% confidence",
                        data: filteredData.datasets.heighty,
                        borderDash: [3, 3],
                        type: "line",
                        fill: false,
                        backgroundColor: "#ebe0ff",
                        borderColor: "#b088ff",
                    },
                    {
                        label: "hard 20% confidence",
                        data: filteredData.datasets.hardTwenty,
                        borderDash: [3, 3],
                        type: "line",
                        fill: false,
                        backgroundColor: "#fff5dd",
                        borderColor: "#ffdc87",
                    },
                    {
                        label: "hard 50% confidence",
                        data: filteredData.datasets.hardFifty,
                        borderDash: [3, 3],
                        type: "line",
                        fill: false,
                        backgroundColor: "#fff5dd",
                        borderColor: "#ffdc87",
                    },
                    {
                        label: "hard 80% confidence",
                        data: filteredData.datasets.hardHeighty,
                        borderDash: [3, 3],
                        type: "line",
                        fill: false,
                        backgroundColor: "#fff5dd",
                        borderColor: "#ffdc87",
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
    <p>
        <span
            >"Product Line" in ("Perf & Comp", "Talent Review", "Talent
            Management > Career") AND project = CAR AND resolved > "-180d"
            <br />
            CC => "Epic Link" in (CC-2305, CC-2315, CC-1406, CC-2223, CC-2374)
            <br />
            NewForm => "Epic Link" in (CAR-47157, CAR-55744, CAR-38718, CAR-44713,CAR-54459,
            CAR-51141)</span
        >
        <input type="text" placeholder="JQL..." bind:value={jql} />
        <button on:click={submit}>Analyse</button>
    </p>
</section>
<section id="content">
    <aside>
        <div>
            Zoom on last <input type="number" bind:value={zoom} min="2" /> weeks
        </div>
        <div>
            Analyze on last
            <input
                type="number"
                bind:value={analyze}
                min="2"
                on:change={submit}
            /> weeks
        </div>
        <canvas id="chart" width="5" height="2" />
    </aside>
</section>

<style>
    aside {
        width: 100%;
    }

    input[type="number"] {
        width: 50px;
        display: inline-block;
    }
</style>
