/* ========================================
   MOCK DE DADOS

   Futuramente virá da API.
======================================== */

const progressData = {

    agachamento: {
        nome: "Agachamento",
        labels: ["Mai", "Jun", "Jul", "Ago", "Set"],
        cargas: [40, 45, 50, 55, 60]
    },

    legpress: {
        nome: "Leg press",
        labels: ["Mai", "Jun", "Jul", "Ago", "Set"],
        cargas: [70, 80, 85, 90, 100]
    },

    supino: {
        nome: "Supino reto",
        labels: ["Mai", "Jun", "Jul", "Ago", "Set"],
        cargas: [25, 30, 32.5, 35, 40]
    },

    remada: {
        nome: "Remada baixa",
        labels: ["Mai", "Jun", "Jul", "Ago", "Set"],
        cargas: [35, 40, 45, 50, 55]
    }

};


const frequencyData = {

    labels: [
        "Sem 1",
        "Sem 2",
        "Sem 3",
        "Sem 4",
        "Sem 5",
        "Sem 6"
    ],

    treinos: [3, 4, 3, 5, 4, 4]

};


/* ========================================
   ELEMENTOS
======================================== */

const exerciseSelect =
    document.getElementById("exercise-select");

const currentWeight =
    document.getElementById("current-weight");

const weightGrowth =
    document.getElementById("weight-growth");


/* ========================================
   CONFIGURAÇÃO PADRÃO CHART.JS
======================================== */

Chart.defaults.color = "#747b84";

Chart.defaults.font.family =
    "Inter, Arial, sans-serif";


/* ========================================
   GRÁFICO DE CARGA
======================================== */

const weightCanvas =
    document.getElementById("weight-chart");


const initialExercise =
    progressData.agachamento;


const weightChart = new Chart(

    weightCanvas,

    {
        type: "line",

        data: {

            labels:
                initialExercise.labels,

            datasets: [

                {
                    label: "Carga",

                    data:
                        initialExercise.cargas,

                    borderColor: "#b7ff3c",

                    backgroundColor:
                        "rgba(183, 255, 60, 0.08)",

                    borderWidth: 2,

                    pointRadius: 4,

                    pointHoverRadius: 6,

                    pointBackgroundColor:
                        "#b7ff3c",

                    pointBorderColor:
                        "#171b20",

                    pointBorderWidth: 2,

                    fill: true,

                    tension: 0.35
                }

            ]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    backgroundColor: "#111419",

                    borderColor: "#30363d",

                    borderWidth: 1,

                    padding: 10,

                    displayColors: false,

                    callbacks: {

                        label: function(context) {
                            return `${context.parsed.y} kg`;
                        }

                    }

                }

            },


            scales: {

                x: {

                    grid: {
                        display: false
                    },

                    border: {
                        display: false
                    },

                    ticks: {
                        font: {
                            size: 10
                        }
                    }

                },


                y: {

                    beginAtZero: false,

                    border: {
                        display: false
                    },

                    grid: {
                        color: "rgba(255,255,255,0.045)"
                    },

                    ticks: {

                        font: {
                            size: 10
                        },

                        callback: function(value) {
                            return `${value} kg`;
                        }

                    }

                }

            }

        }

    }

);


/* ========================================
   TROCAR EXERCÍCIO
======================================== */

function updateWeightChart(exerciseKey) {

    const exercise =
        progressData[exerciseKey];


    weightChart.data.labels =
        exercise.labels;


    weightChart.data.datasets[0].data =
        exercise.cargas;


    weightChart.update();


    const firstWeight =
        exercise.cargas[0];


    const lastWeight =
        exercise.cargas[
            exercise.cargas.length - 1
        ];


    const growth =
        lastWeight - firstWeight;


    currentWeight.textContent =
        `${lastWeight} kg`;


    weightGrowth.textContent =
        `+${growth} kg no período`;

}


exerciseSelect.addEventListener(
    "change",
    (event) => {

        updateWeightChart(
            event.target.value
        );

    }
);


/* ========================================
   GRÁFICO DE FREQUÊNCIA
======================================== */

const frequencyCanvas =
    document.getElementById(
        "frequency-chart"
    );


const frequencyChart = new Chart(

    frequencyCanvas,

    {
        type: "bar",

        data: {

            labels:
                frequencyData.labels,

            datasets: [

                {
                    data:
                        frequencyData.treinos,

                    backgroundColor:
                        "rgba(183, 255, 60, 0.7)",

                    borderRadius: 5,

                    borderSkipped: false,

                    maxBarThickness: 42
                }

            ]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    backgroundColor: "#111419",

                    borderColor: "#30363d",

                    borderWidth: 1,

                    displayColors: false,

                    callbacks: {

                        label: function(context) {

                            const value =
                                context.parsed.y;

                            return `${value} ${
                                value === 1
                                    ? "treino"
                                    : "treinos"
                            }`;

                        }

                    }

                }

            },


            scales: {

                x: {

                    border: {
                        display: false
                    },

                    grid: {
                        display: false
                    },

                    ticks: {

                        font: {
                            size: 10
                        }

                    }

                },


                y: {

                    beginAtZero: true,

                    suggestedMax: 6,

                    ticks: {

                        stepSize: 1,

                        font: {
                            size: 10
                        }

                    },

                    border: {
                        display: false
                    },

                    grid: {
                        color: "rgba(255,255,255,0.045)"
                    }

                }

            }

        }

    }

);


/* ========================================
   INICIALIZAÇÃO
======================================== */

updateWeightChart("agachamento");

lucide.createIcons();