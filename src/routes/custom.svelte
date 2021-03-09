<script>
    import { afterUpdate } from "svelte";
    import Chart from "chart.js";

    let jql = '"Epic Link" = CAR-38718';
    let data;
    async function submit() {
        const url =
            "customApi?" +
            new URLSearchParams({ jql: encodeURIComponent(jql) });
        const res = await fetch(url);
        data = await res.json();
        //console.log(data);
        renderChart(data);
    }

    let ctx;
    let chart;

    function renderChart(data) {
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
                        backgroundColor: "#d7ecfb",
                        borderColor: "#4eaeee",
                        borderWidth: "1",
                    },
                    {
                        label: "done",
                        data: data.datasets.done,
                        //backgroundColor: "#d7ecfb",
                        //borderColor: "#4eaeee",
                        borderWidth: "1",
                    },
                    {
                        label: "todo",
                        data: data.datasets.todo,
                        type: "line",
                        fill: false,
                        borderColor: "#ffe0e6",
                        backgroundColor: "#ffaebf",
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

    //afterUpdate(renderChart);
</script>

<section>
    <p>
        <span
            >"Product Line" in ("Perf & Comp", "Talent Review", "Talent
            Management > Career") AND project = CAR AND resolved > "-180d"
            <br />
            "Epic Link" = CAR-38718</span
        >
        <input type="text" placeholder="JQL..." bind:value={jql} />
        <button on:click={submit}>Analyse</button>
    </p>
</section>
<section>
    <canvas id="chart" width="2" height="1" />
</section>
