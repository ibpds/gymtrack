(function () {

/* ========================================
   CONFIGURAÇÃO
======================================== */

const WEEKS_COUNT = 6;

const RECORDS_DISPLAY_LIMIT = 4;

const HISTORY_DISPLAY_LIMIT = 3;


/* ========================================
   ELEMENTOS
======================================== */

const totalWorkoutsEl =
    document.getElementById("total-workouts");

const currentStreakEl =
    document.getElementById("current-streak");

const personalRecordsEl =
    document.getElementById("personal-records");

const totalVolumeEl =
    document.getElementById("total-volume");

const exerciseSelect =
    document.getElementById("exercise-select");

const currentWeightEl =
    document.getElementById("current-weight");

const weightGrowthEl =
    document.getElementById("weight-growth");

const loadChartEmptyEl =
    document.getElementById("load-chart-empty");

const recordsListEl =
    document.getElementById("records-list");

const historyListEl =
    document.getElementById("history-list");


/* ========================================
   UTILITÁRIOS
======================================== */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


function toValidNumber(value) {

    const num = Number(value);

    return Number.isFinite(num) ? num : 0;

}


function normalizeExerciseKey(nome) {

    return String(nome || "").trim().toLowerCase();

}


function parseDate(value) {

    const date = new Date(value);

    return isNaN(date.getTime()) ? null : date;

}


function formatVolume(volume) {

    return `${Math.round(volume).toLocaleString("pt-BR")} kg`;

}


function formatDuration(seconds) {

    const minutes = Math.round(toValidNumber(seconds) / 60);

    return `${minutes} min`;

}


function formatSessionDate(isoString) {

    const date = parseDate(isoString);

    if (!date) {
        return "--";
    }

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${dd}/${mm}/${yyyy}, ${hh}:${min}`;

}


function formatDateShort(dateLike) {

    const date =
        dateLike instanceof Date
            ? dateLike
            : parseDate(dateLike);

    if (!date) {
        return "--";
    }

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");

    return `${dd}/${mm}`;

}


/*
    Semana sempre SEGUNDA-FEIRA → DOMINGO,
    calculada com base no horário local
    (evita bugs de fuso em sessões de domingo).
*/

function getMonday(date) {

    const local =
        new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const day = local.getDay();

    const diffToMonday = day === 0 ? -6 : 1 - day;

    local.setDate(local.getDate() + diffToMonday);

    return local;

}


function getWeekKey(date) {

    const monday = getMonday(date);

    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, "0");
    const dd = String(monday.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;

}


/* ========================================
   SÉRIES / VOLUME
======================================== */

function getCompletedSeries(exercicio) {

    return (exercicio?.series || []).filter(
        (serie) => serie && serie.concluida === true
    );

}


function calculateSessionVolume(session) {

    let volume = 0;

    (session.exercicios || []).forEach((exercicio) => {

        getCompletedSeries(exercicio).forEach((serie) => {

            volume +=
                toValidNumber(serie.repeticoes) *
                toValidNumber(serie.carga);

        });

    });

    return volume;

}


function calculateTotalVolume(history) {

    return history.reduce(
        (total, session) => total + calculateSessionVolume(session),
        0
    );

}


/* ========================================
   EXERCÍCIOS (evolução / PR / carga atual)
======================================== */

/*
    Um "entry" representa a MAIOR carga concluída
    de um exercício dentro de UMA sessão.
*/

function buildExerciseEntries(history) {

    const entries = [];

    history.forEach((session) => {

        (session.exercicios || []).forEach((exercicio) => {

            const completed = getCompletedSeries(exercicio);

            if (completed.length === 0) {
                return;
            }

            const maiorCarga = completed.reduce(
                (max, serie) =>
                    Math.max(max, toValidNumber(serie.carga)),
                0
            );

            entries.push({
                key: normalizeExerciseKey(exercicio.nome),
                displayName: String(exercicio.nome || "").trim(),
                carga: maiorCarga,
                data: session.realizadoEm
            });

        });

    });

    return entries;

}


function groupEntriesByExercise(entries) {

    const grouped = new Map();

    entries.forEach((entry) => {

        if (!grouped.has(entry.key)) {
            grouped.set(entry.key, []);
        }

        grouped.get(entry.key).push(entry);

    });

    grouped.forEach((list) => {

        list.sort((a, b) => {

            const dateA = parseDate(a.data);
            const dateB = parseDate(b.data);

            return (dateA ? dateA.getTime() : 0) -
                (dateB ? dateB.getTime() : 0);

        });

    });

    return grouped;

}


function getDisplayName(entriesForExercise) {

    return entriesForExercise[entriesForExercise.length - 1].displayName;

}


function getExerciseOptions(groupedMap) {

    return Array.from(groupedMap.entries())
        .map(([key, entries]) => ({
            key,
            nome: getDisplayName(entries)
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

}


function getExerciseProgress(key, groupedMap) {

    const entries = groupedMap.get(key) || [];

    return {
        labels: entries.map((entry) => formatDateShort(entry.data)),
        cargas: entries.map((entry) => entry.carga),
        inicial: entries.length > 0 ? entries[0].carga : 0,
        atual: entries.length > 0 ? entries[entries.length - 1].carga : 0
    };

}


function calculateGrowthPercent(inicial, atual, sessionCount) {

    if (sessionCount <= 1) {
        return 0;
    }

    if (inicial === 0) {
        return null;
    }

    return ((atual - inicial) / inicial) * 100;

}


function calculatePersonalRecords(groupedMap) {

    const records = [];

    groupedMap.forEach((entries) => {

        let best = entries[0];

        entries.forEach((entry) => {

            if (entry.carga > best.carga) {
                best = entry;
            }

        });

        records.push({
            nome: getDisplayName(entries),
            maiorCarga: best.carga,
            dataDoRecorde: best.data
        });

    });

    records.sort((a, b) => {

        const dateA = parseDate(a.dataDoRecorde);
        const dateB = parseDate(b.dataDoRecorde);

        return (dateB ? dateB.getTime() : 0) -
            (dateA ? dateA.getTime() : 0);

    });

    return records;

}


/* ========================================
   FREQUÊNCIA SEMANAL / SEQUÊNCIA
======================================== */

function buildWeeklyCounts(history) {

    const counts = new Map();

    history.forEach((session) => {

        const date = parseDate(session.realizadoEm);

        if (!date) {
            return;
        }

        const key = getWeekKey(date);

        counts.set(key, (counts.get(key) || 0) + 1);

    });

    return counts;

}


function calculateWeeklyFrequency(history, weeksCount) {

    const counts = buildWeeklyCounts(history);

    const currentMonday = getMonday(new Date());

    const weeks = [];

    for (let i = weeksCount - 1; i >= 0; i--) {

        const monday = new Date(currentMonday);

        monday.setDate(monday.getDate() - (i * 7));

        weeks.push({
            label: formatDateShort(monday),
            total: counts.get(getWeekKey(monday)) || 0
        });

    }

    return weeks;

}


function calculateStreak(history) {

    const counts = buildWeeklyCounts(history);

    if (counts.size === 0) {
        return 0;
    }

    const cursor = getMonday(new Date());

    if (!counts.get(getWeekKey(cursor))) {
        cursor.setDate(cursor.getDate() - 7);
    }

    let streak = 0;

    while (counts.get(getWeekKey(cursor))) {

        streak++;

        cursor.setDate(cursor.getDate() - 7);

    }

    return streak;

}


/* ========================================
   CHART.JS — CONFIGURAÇÃO PADRÃO
======================================== */

Chart.defaults.color = "#747b84";

Chart.defaults.font.family =
    "Inter, Arial, sans-serif";


function createLoadChart() {

    const canvas =
        document.getElementById("weight-chart");

    return new Chart(canvas, {

        type: "line",

        data: {

            labels: [],

            datasets: [

                {
                    label: "Carga",

                    data: [],

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

    });

}


function createFrequencyChart() {

    const canvas =
        document.getElementById("frequency-chart");

    return new Chart(canvas, {

        type: "bar",

        data: {

            labels: [],

            datasets: [

                {
                    data: [],

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

    });

}


/* ========================================
   RENDER — RESUMO
======================================== */

function renderSummary({ totalWorkouts, streak, recordsCount, totalVolume }) {

    totalWorkoutsEl.textContent =
        String(totalWorkouts);

    currentStreakEl.textContent =
        String(streak);

    personalRecordsEl.textContent =
        String(recordsCount);

    totalVolumeEl.textContent =
        formatVolume(totalVolume);

}


/* ========================================
   RENDER — GRÁFICO DE CARGA
======================================== */

let weightChart = null;

let exerciseEntriesMap = new Map();


function populateExerciseSelect(options) {

    exerciseSelect.innerHTML = "";

    if (options.length === 0) {

        const emptyOption =
            document.createElement("option");

        emptyOption.value = "";
        emptyOption.textContent = "Nenhum exercício registrado";
        emptyOption.disabled = true;
        emptyOption.selected = true;

        exerciseSelect.appendChild(emptyOption);

        exerciseSelect.disabled = true;

        return;
    }

    exerciseSelect.disabled = false;

    options.forEach(({ key, nome }) => {

        const option =
            document.createElement("option");

        option.value = key;
        option.textContent = nome;

        exerciseSelect.appendChild(option);

    });

}


function formatGrowthText(growth) {

    if (growth === null) {
        return "-- no período";
    }

    const rounded = Math.round(growth);

    const sign = rounded > 0 ? "+" : "";

    return `${sign}${rounded}% no período`;

}


function renderLoadChart(key) {

    if (!key) {

        weightChart.data.labels = [];
        weightChart.data.datasets[0].data = [];

        weightChart.update();

        currentWeightEl.textContent = "--";
        weightGrowthEl.textContent = "-- no período";

        loadChartEmptyEl.hidden = false;

        return;
    }

    loadChartEmptyEl.hidden = true;

    const progress =
        getExerciseProgress(key, exerciseEntriesMap);

    weightChart.data.labels = progress.labels;
    weightChart.data.datasets[0].data = progress.cargas;

    weightChart.update();

    currentWeightEl.textContent =
        `${progress.atual} kg`;

    const growth =
        calculateGrowthPercent(
            progress.inicial,
            progress.atual,
            progress.cargas.length
        );

    weightGrowthEl.textContent =
        formatGrowthText(growth);

}


/* ========================================
   RENDER — FREQUÊNCIA
======================================== */

function renderFrequencyChart(frequencyChart, weeks) {

    frequencyChart.data.labels =
        weeks.map((week) => week.label);

    frequencyChart.data.datasets[0].data =
        weeks.map((week) => week.total);

    frequencyChart.update();

}


/* ========================================
   RENDER — RECORDES
======================================== */

function renderRecords(records) {

    recordsListEl.innerHTML = "";

    if (records.length === 0) {

        recordsListEl.innerHTML = `

            <div class="progress-empty">

                <i data-lucide="trophy"></i>

                <strong>Nenhum recorde ainda</strong>

                <span>
                    Finalize seu primeiro treino para acompanhar seus recordes aqui.
                </span>

            </div>

        `;

        return;
    }

    records
        .slice(0, RECORDS_DISPLAY_LIMIT)
        .forEach((record) => {

            const item =
                document.createElement("div");

            item.className = "record-item";

            item.innerHTML = `

                <div class="record-icon">
                    <i data-lucide="trophy"></i>
                </div>

                <div class="record-info">
                    <strong>${escapeHtml(record.nome)}</strong>
                    <span>Melhor carga</span>
                </div>

                <strong class="record-value">
                    ${record.maiorCarga} kg
                </strong>

            `;

            recordsListEl.appendChild(item);

        });

}


/* ========================================
   RENDER — HISTÓRICO RECENTE
======================================== */

function renderHistory(sessionsDesc) {

    historyListEl.innerHTML = "";

    if (sessionsDesc.length === 0) {

        historyListEl.innerHTML = `

            <div class="progress-empty">

                <i data-lucide="dumbbell"></i>

                <strong>Você ainda não possui histórico de treinos.</strong>

                <span>
                    Finalize seu primeiro treino para acompanhar sua evolução.
                </span>

            </div>

        `;

        return;
    }

    sessionsDesc
        .slice(0, HISTORY_DISPLAY_LIMIT)
        .forEach((session) => {

            const item =
                document.createElement("div");

            item.className = "history-item";

            const exerciseCount =
                (session.exercicios || []).length;

            item.innerHTML = `

                <div class="history-icon">
                    <i data-lucide="dumbbell"></i>
                </div>

                <div class="history-workout">
                    <strong>${escapeHtml(session.treinoNome || "Treino")}</strong>
                    <span>${formatSessionDate(session.realizadoEm)}</span>
                </div>

                <div class="history-data">
                    <span>DURAÇÃO</span>
                    <strong>${formatDuration(session.duracaoSegundos)}</strong>
                </div>

                <div class="history-data">
                    <span>EXERCÍCIOS</span>
                    <strong>${exerciseCount}</strong>
                </div>

                <div class="history-status">
                    <i data-lucide="check"></i>
                    Concluído
                </div>

            `;

            historyListEl.appendChild(item);

        });

}


/* ========================================
   INICIALIZAÇÃO
======================================== */

function init() {

    const history =
        GymTrackStorage.getHistory();

    const historyDesc =
        [...history].sort((a, b) => {

            const dateA = parseDate(a.realizadoEm);
            const dateB = parseDate(b.realizadoEm);

            return (dateB ? dateB.getTime() : 0) -
                (dateA ? dateA.getTime() : 0);

        });


    const totalVolume =
        calculateTotalVolume(history);

    const entries =
        buildExerciseEntries(history);

    exerciseEntriesMap =
        groupEntriesByExercise(entries);

    const records =
        calculatePersonalRecords(exerciseEntriesMap);

    const streak =
        calculateStreak(history);

    const weeks =
        calculateWeeklyFrequency(history, WEEKS_COUNT);


    renderSummary({
        totalWorkouts: history.length,
        streak,
        recordsCount: exerciseEntriesMap.size,
        totalVolume
    });


    const exerciseOptions =
        getExerciseOptions(exerciseEntriesMap);

    populateExerciseSelect(exerciseOptions);


    weightChart = createLoadChart();

    renderLoadChart(
        exerciseOptions.length > 0 ? exerciseOptions[0].key : null
    );

    exerciseSelect.addEventListener("change", (event) => {

        renderLoadChart(event.target.value || null);

    });


    const frequencyChart = createFrequencyChart();

    renderFrequencyChart(frequencyChart, weeks);


    renderRecords(records);

    renderHistory(historyDesc);


    lucide.createIcons();

}


init();

})();
