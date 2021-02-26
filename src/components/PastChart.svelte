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
                        label: "nb stories",
                        /*data: [
                            { x: "2016-12-25", y: 20 },
                            { x: "2016-12-26", y: 10 },
                            { x: "2017-02-16", y: 15 },
                            { x: "2017-12-26", y: 5 },
                        ],*/
                        data: data,
                    },
                ],
            },
            options: {
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
                                precision: 0,
                                suggestedMin: 0,
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

<canvas {id} width="2" height="1" />
