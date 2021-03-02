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
                        label: "nombre",
                        data: data,
                        backgroundColor: "#d7ecfb",
                        borderColor: "#4eaeee",
                        borderWidth: "1",
                    },
                ],
            },
            options: {
                title: {
                    display: true,
                    text: "Nombre de Stories 'Done' chaque semaines:",
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
