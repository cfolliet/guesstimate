<script>
    import { afterUpdate } from "svelte";
    import Chart from "chart.js";

    export let data;
    export let id;
    let ctx;
    let chart;

    function renderChart() {
        ctx = document.getElementById(id);
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(ctx, {
            type: "bar",
            data: {
                datasets: [
                    {
                        label: "cette semaine",
                        data: data.percent,
                        backgroundColor: "#dbf2f2",
                        borderColor: "#63c8c8",
                        borderWidth: "1",
                    },
                    {
                        label: "cette semaine ou avant",
                        data: data.cumulative,
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
                    text: "Probabilité de finir les stories:",
                },
                scales: {
                    xAxes: [
                        {
                            type: "time",
                            time: {
                                unit: "week",
                                isoWeekday: true,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                                precision: 0,
                                suggestedMax: 3,
                                suggestedMax: 100,
                            },
                        },
                    ],
                },
            },
        });
    }

    afterUpdate(renderChart);
</script>

<div>
    <canvas {id} width="1" height="1" />
</div>

<style>
    div {
        width: 400px;
    }
</style>
