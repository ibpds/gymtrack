(async function () {

/* ========================================
   CARREGAR TREINO DA API
======================================== */

const urlParams = new URLSearchParams(window.location.search);
const workoutId = urlParams.get("id");

if (!workoutId) {
    alert("Nenhum treino especificado.");
    window.location.href = "treinos.html";
    return;
}

let workout = null;
try {
    workout = await GymTrackAPI.treinos.getById(workoutId);
} catch (err) {
    console.error("Erro ao carregar treino:", err);
    alert("Treino não encontrado no banco de dados.");
    window.location.href = "treinos.html";
    return;
}

if (!workout || !workout.exercicios || workout.exercicios.length === 0) {
    alert("Este treino não possui exercícios configurados.");
    window.location.href = "treinos.html";
    return;
}

/* ========================================
   ESTADO
======================================== */

let currentExerciseIndex = 0;
let workoutSeconds = 0;
let isFinishing = false;

/* TIMER DE DESCANSO */
let restInterval = null;
let restSeconds = 0;
let restTotalSeconds = 0;

/*
    Aqui guardaremos o que a pessoa REALMENTE fez no treino.
*/
const workoutResults = workout.exercicios.map((exercise) => {
    const nome = exercise.nome || (exercise.exercicio && exercise.exercicio.nome) || exercise.exercicio_nome || "Exercício";
    const seriesCount = exercise.series || exercise.series_planejadas || 4;
    const repsCount = exercise.repeticoes || exercise.repeticoes_planejadas || 10;
    const cargaWeight = exercise.carga || exercise.carga_planejada || 0;
    const descansoSec = exercise.descanso ?? 60;
    const obs = exercise.observacao || "";

    return {
        exercicioId: exercise.exercicio_id || (exercise.exercicio && exercise.exercicio.id) || null,
        nome,
        seriesPlanejadas: seriesCount,
        repeticoesPlanejadas: repsCount,
        cargaPlanejada: cargaWeight,
        descanso: descansoSec,
        observacao: obs,
        series: Array.from(
            { length: seriesCount },
            () => ({
                repeticoes: repsCount,
                carga: cargaWeight,
                concluida: false
            })
        )
    };
});

/* ========================================
   ELEMENTOS
======================================== */

const workoutTitle = document.getElementById("workout-title");
const exerciseCounter = document.getElementById("exercise-counter");
const exerciseNumber = document.getElementById("exercise-number");
const exerciseName = document.getElementById("exercise-name");
const exerciseTarget = document.getElementById("exercise-target");
const exerciseObservation = document.getElementById("exercise-observation");
const seriesList = document.getElementById("series-list");
const previousButton = document.getElementById("previous-exercise");
const nextButton = document.getElementById("next-exercise");
const progressFill = document.getElementById("workout-progress-fill");
const progressText = document.getElementById("workout-progress-text");
const dotsContainer = document.getElementById("exercise-dots");
const finishButton = document.getElementById("finish-workout");
const leaveButton = document.getElementById("leave-workout");
const restTimer = document.getElementById("rest-timer");
const restTime = document.getElementById("rest-time");
const restProgress = document.getElementById("rest-progress");
const skipRestButton = document.getElementById("skip-rest");

/* ========================================
   RENDERIZAR EXERCÍCIO
======================================== */

function renderExercise() {
    const currentEx = workoutResults[currentExerciseIndex];

    workoutTitle.textContent = workout.nome;
    exerciseCounter.textContent = `Exercício ${currentExerciseIndex + 1} de ${workoutResults.length}`;
    exerciseNumber.textContent = String(currentExerciseIndex + 1).padStart(2, "0");
    exerciseName.textContent = currentEx.nome;
    exerciseTarget.textContent = `${currentEx.seriesPlanejadas} séries × ${currentEx.repeticoesPlanejadas} repetições`;

    const observationText = exerciseObservation.querySelector("span");
    if (currentEx.observacao) {
        exerciseObservation.style.display = "flex";
        observationText.textContent = currentEx.observacao;
    } else {
        exerciseObservation.style.display = "none";
    }

    renderSeries(currentEx);
    renderDots();
    updateNavigation();
    updateProgress();
    if (window.lucide) lucide.createIcons();
}

/* ========================================
   RENDERIZAR SÉRIES
======================================== */

function renderSeries(currentEx) {
    seriesList.innerHTML = "";

    currentEx.series.forEach((serie, index) => {
        const row = document.createElement("div");
        row.classList.add("series-row");

        if (serie.concluida) {
            row.classList.add("completed");
        }

        row.innerHTML = `
            <div class="series-number">${index + 1}</div>

            <div class="series-input">
                <input
                    type="number"
                    min="0"
                    value="${serie.repeticoes}"
                    data-field="repeticoes"
                    data-index="${index}"
                >
            </div>

            <div class="series-input input-with-unit">
                <input
                    type="number"
                    min="0"
                    step="0.5"
                    value="${serie.carga}"
                    data-field="carga"
                    data-index="${index}"
                >
                <span>kg</span>
            </div>

            <button
                type="button"
                class="complete-series-btn ${serie.concluida ? "completed" : ""}"
                data-index="${index}"
                aria-label="Marcar série como concluída"
            >
                <i data-lucide="check"></i>
            </button>
        `;

        seriesList.appendChild(row);
    });

    addSeriesEvents();
}

/* ========================================
   EVENTOS DAS SÉRIES
======================================== */

function addSeriesEvents() {
    const inputs = seriesList.querySelectorAll("input");

    inputs.forEach((input) => {
        input.addEventListener("change", () => {
            const index = Number(input.dataset.index);
            const field = input.dataset.field;
            workoutResults[currentExerciseIndex].series[index][field] = Number(input.value);
        });
    });

    const buttons = seriesList.querySelectorAll(".complete-series-btn");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.index);
            const serie = workoutResults[currentExerciseIndex].series[index];
            const wasCompleted = serie.concluida;

            serie.concluida = !serie.concluida;

            const isLastSeries = index === workoutResults[currentExerciseIndex].series.length - 1;

            renderExercise();

            if (!wasCompleted && !isLastSeries) {
                const seconds = workoutResults[currentExerciseIndex].descanso || 60;
                iniciarDescanso(seconds);
            }
        });
    });
}

/* ========================================
   PROGRESSO
======================================== */

function updateProgress() {
    let totalSeries = 0;
    let completedSeries = 0;

    workoutResults.forEach((exercise) => {
        exercise.series.forEach((serie) => {
            totalSeries++;
            if (serie.concluida) completedSeries++;
        });
    });

    const percentage = totalSeries === 0 ? 0 : Math.round((completedSeries / totalSeries) * 100);
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

function sessaoTemProgresso() {
    return workoutResults.some((result) =>
        result.series.some((serie) =>
            serie.concluida ||
            serie.repeticoes !== result.repeticoesPlanejadas ||
            serie.carga !== result.cargaPlanejada
        )
    );
}

/* ========================================
   DOTS
======================================== */

function renderDots() {
    dotsContainer.innerHTML = "";

    workoutResults.forEach((result, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.classList.add("exercise-dot");

        if (index === currentExerciseIndex) {
            dot.classList.add("active");
        }

        const completed = result.series.every((serie) => serie.concluida);
        if (completed) {
            dot.classList.add("completed");
        }

        dot.addEventListener("click", () => {
            if (index === currentExerciseIndex) return;
            pararDescanso();
            currentExerciseIndex = index;
            renderExercise();
        });

        dotsContainer.appendChild(dot);
    });
}

/* ========================================
   NAVEGAÇÃO
======================================== */

function updateNavigation() {
    previousButton.disabled = currentExerciseIndex === 0;

    if (currentExerciseIndex === workoutResults.length - 1) {
        nextButton.innerHTML = `
            Finalizar
            <i data-lucide="flag"></i>
        `;
    } else {
        nextButton.innerHTML = `
            Próximo
            <i data-lucide="arrow-right"></i>
        `;
    }
}

previousButton.addEventListener("click", () => {
    if (currentExerciseIndex > 0) {
        pararDescanso();
        currentExerciseIndex--;
        renderExercise();
    }
});

nextButton.addEventListener("click", () => {
    if (currentExerciseIndex < workoutResults.length - 1) {
        pararDescanso();
        currentExerciseIndex++;
        renderExercise();
    } else {
        finalizarTreino();
    }
});

/* ========================================
   TIMER
======================================== */

function updateTimer() {
    workoutSeconds++;
    const minutes = Math.floor(workoutSeconds / 60);
    const seconds = workoutSeconds % 60;
    const timeEl = document.getElementById("workout-time");
    if (timeEl) {
        timeEl.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
}

setInterval(updateTimer, 1000);

/* ========================================
   TIMER DE DESCANSO
======================================== */

function iniciarDescanso(seconds) {
    pararDescanso();
    if (!seconds || seconds <= 0) return;

    restSeconds = seconds;
    restTotalSeconds = seconds;
    restTimer.style.display = "flex";
    atualizarTimerDescanso();

    restInterval = setInterval(() => {
        restSeconds--;
        if (restSeconds <= 0) {
            restSeconds = 0;
            atualizarTimerDescanso();
            pararDescanso();
            return;
        }
        atualizarTimerDescanso();
    }, 1000);
}

function atualizarTimerDescanso() {
    const minutes = Math.floor(restSeconds / 60);
    const seconds = restSeconds % 60;
    restTime.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const percentage = restTotalSeconds === 0 ? 0 : (restSeconds / restTotalSeconds) * 100;
    restProgress.style.width = `${percentage}%`;
}

function pararDescanso() {
    if (restInterval) {
        clearInterval(restInterval);
        restInterval = null;
    }
    restTimer.style.display = "none";
}

skipRestButton.addEventListener("click", () => pararDescanso());

leaveButton.addEventListener("click", () => {
    if (sessaoTemProgresso()) {
        const confirmLeave = confirm("Seu progresso neste treino não será salvo no banco de dados. Deseja sair?");
        if (!confirmLeave) return;
    }
    window.location.href = "treinos.html";
});

/* ========================================
   FINALIZAR E ENVIAR PARA O BACKEND
======================================== */

async function finalizarTreino() {
    if (isFinishing) return;

    let totalSeries = 0;
    let completedSeries = 0;

    workoutResults.forEach((exercise) => {
        exercise.series.forEach((serie) => {
            totalSeries++;
            if (serie.concluida) completedSeries++;
        });
    });

    if (completedSeries < totalSeries) {
        const confirmFinish = confirm(
            `Você concluiu ${completedSeries} de ${totalSeries} séries. Deseja finalizar e registrar no banco mesmo assim?`
        );
        if (!confirmFinish) return;
    }

    isFinishing = true;
    finishButton.disabled = true;
    finishButton.textContent = "Salvando no banco...";

    const user = GymTrackAPI.auth.getCurrentUser();
    const todayStr = new Date().toISOString().split("T")[0];

    const execucaoPayload = {
        treino_id: Number(workout.id),
        usuario_id: user.id,
        data_execucao: todayStr,
        duracao_segundos: workoutSeconds,
        exercicios: workoutResults.map((ex) => {
            const completedSets = ex.series.filter(s => s.concluida);
            const setsToUse = completedSets.length > 0 ? completedSets : ex.series;
            const maxWeight = setsToUse.reduce((max, s) => Math.max(max, Number(s.carga) || 0), 0);
            const avgReps = Math.round(
                setsToUse.reduce((sum, s) => sum + (Number(s.repeticoes) || 0), 0) / setsToUse.length
            ) || 1;

            return {
                exercicio_id: ex.exercicioId,
                exercicio_nome: ex.nome,
                series_realizadas: setsToUse.length,
                repeticoes_realizadas: avgReps,
                carga_realizada: maxWeight
            };
        })
    };

    try {
        const resposta = await GymTrackAPI.execucoes.create(execucaoPayload);
        console.log("Execução registrada na API com sucesso:", resposta);

        // Verificar se houve recorde pessoal (PR)
        const prsAtingidos = (resposta.exercicios_executados || []).filter(ex => ex.pr === 1);

        if (prsAtingidos.length > 0) {
            const nomesPr = prsAtingidos.map(p => {
                const exFound = workoutResults.find(w => w.exercicioId === p.exercicio_id || w.nome === p.exercicio_nome);
                return `${exFound ? exFound.nome : 'Exercício'} (${p.carga_realizada} kg)`;
            }).join(", ");
            alert(`🏆 NOVO RECORDE PESSOAL (PR)! Parabéns! Você superou sua carga anterior em: ${nomesPr}!`);
        } else {
            alert("Treino finalizado e salvo com sucesso no banco de dados!");
        }

        window.location.href = "dashboard.html";
    } catch (err) {
        console.error("Erro ao salvar execução no backend:", err);
        alert("Erro ao registrar treino no backend: " + err.message);
        finishButton.disabled = false;
        finishButton.textContent = "Finalizar";
        isFinishing = false;
    }
}

finishButton.addEventListener("click", finalizarTreino);

/* ========================================
   INICIALIZAÇÃO
======================================== */

renderExercise();
if (window.lucide) lucide.createIcons();

})();
