<script>
    import { afterUpdate } from "svelte";
    import Chart from "chart.js";
    import { parseISO, isAfter } from "date-fns";

    let jql = '"Epic Link" = CAR-38718';
    let zoomBeginDate;
    let analyzeBeginDate;
    let data;

    async function submit() {
        const url =
            "customApi?" +
            new URLSearchParams({
                jql: encodeURIComponent(jql),
                analyzeBeginDate,
            });
        const res = await fetch(url);
        data = await res.json();
        //console.log(data);
        renderChart(data);
    }

    let ctx;
    let chart;

    function renderChart() {
        if (!data) {
            return;
        }
        const filteredData = JSON.parse(JSON.stringify(data));
        if (zoomBeginDate) {
            const date = parseISO(zoomBeginDate);
            for (const datasetName in filteredData.datasets) {
                const newSet = filteredData.datasets[datasetName].filter((r) =>
                    isAfter(parseISO(r.x), date)
                );
                filteredData.datasets[datasetName] = newSet;
            }
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
            "Epic Link" = CAR-38718
            <br />
            NewForm => "Epic Link" in (CAR-47157, CAR-55744, CAR-38718, CAR-44713,CAR-54459,
            CAR-51141)</span
        >
        <input type="text" placeholder="JQL..." bind:value={jql} />
        <button on:click={submit}>Analyse</button>
    </p>
</section>
<section>
    <div>
        <label for="zoom-begin-date">Zoom to begin date:&nbsp;</label>
        <input id="zoom-begin-date" type="date" bind:value={zoomBeginDate} />
    </div>
    <div>
        <label for="analyze-begin-date">Analyze since:&nbsp;</label>
        <input
            id="analyze-begin-date"
            type="date"
            bind:value={analyzeBeginDate}
        />
    </div>
    <canvas id="chart" width="2" height="1" />
</section>
