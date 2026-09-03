/* ========================================
   MOCK DO TREINO

   Futuramente estes dados virão da API.
======================================== */

const workout = {

    id: 1,

    nome: "Pernas & Glúteos",

    exercicios: [

        {
            nome: "Agachamento",
            series: 4,
            repeticoes: 10,
            carga: 40,
            descanso: 60,
            observacao: "Controle a descida e mantenha a postura."
        },

        {
            nome: "Leg press",
            series: 4,
            repeticoes: 12,
            carga: 80,
            descanso: 60,
            observacao: "Mantenha os pés firmes na plataforma."
        },

        {
            nome: "Cadeira extensora",
            series: 3,
            repeticoes: 12,
            carga: 35,
            descanso: 45,
            observacao: "Evite movimentos muito rápidos."
        },

        {
            nome: "Elevação pélvica",
            series: 4,
            repeticoes: 10,
            carga: 50,
            descanso: 60,
            observacao: "Contraia os glúteos no topo do movimento."
        }

    ]

};


/* ========================================
   ESTADO
======================================== */

let currentExerciseIndex = 0;

let workoutSeconds = 0;


/* TIMER DE DESCANSO */

let restInterval = null;

let restSeconds = 0;

let restTotalSeconds = 0;


/*
    Aqui guardaremos o que a pessoa
    REALMENTE fez no treino.
*/

const workoutResults = workout.exercicios.map((exercise) => {

    return {

        nome: exercise.nome,

        series: Array.from(
            { length: exercise.series },
            () => ({
                repeticoes: exercise.repeticoes,
                carga: exercise.carga,
                concluida: false
            })
        )

    };

});


/* ========================================
   ELEMENTOS
======================================== */

const workoutTitle =
    document.getElementById("workout-title");

const exerciseCounter =
    document.getElementById("exercise-counter");

const exerciseNumber =
    document.getElementById("exercise-number");

const exerciseName =
    document.getElementById("exercise-name");

const exerciseTarget =
    document.getElementById("exercise-target");

const exerciseObservation =
    document.getElementById("exercise-observation");

const seriesList =
    document.getElementById("series-list");

const previousButton =
    document.getElementById("previous-exercise");

const nextButton =
    document.getElementById("next-exercise");

const progressFill =
    document.getElementById("workout-progress-fill");

const progressText =
    document.getElementById("workout-progress-text");

const dotsContainer =
    document.getElementById("exercise-dots");

const finishButton =
    document.getElementById("finish-workout");

const restTimer =
    document.getElementById("rest-timer");

const restTime =
    document.getElementById("rest-time");

const restProgress =
    document.getElementById("rest-progress");

const skipRestButton =
    document.getElementById("skip-rest");


/* ========================================
   RENDERIZAR EXERCÍCIO
======================================== */

function renderExercise() {

    const exercise =
        workout.exercicios[currentExerciseIndex];

    const result =
        workoutResults[currentExerciseIndex];


    workoutTitle.textContent =
        workout.nome;


    exerciseCounter.textContent =
        `Exercício ${currentExerciseIndex + 1} de ${workout.exercicios.length}`;


    exerciseNumber.textContent =
        String(currentExerciseIndex + 1).padStart(2, "0");


    exerciseName.textContent =
        exercise.nome;


    exerciseTarget.textContent =
        `${exercise.series} séries × ${exercise.repeticoes} repetições`;


    const observationText =
        exerciseObservation.querySelector("span");


    if (exercise.observacao) {

        exerciseObservation.style.display = "flex";

        observationText.textContent =
            exercise.observacao;

    } else {

        exerciseObservation.style.display = "none";

    }


    renderSeries(result);

    renderDots();

    updateNavigation();

    updateProgress();

    lucide.createIcons();

}


/* ========================================
   RENDERIZAR SÉRIES
======================================== */

function renderSeries(result) {

    seriesList.innerHTML = "";


    result.series.forEach((serie, index) => {

        const row =
            document.createElement("div");

        row.classList.add("series-row");


        if (serie.concluida) {
            row.classList.add("completed");
        }


        row.innerHTML = `

            <div class="series-number">
                ${index + 1}
            </div>


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
                class="complete-series-btn
                ${serie.concluida ? "completed" : ""}"
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

    const inputs =
        seriesList.querySelectorAll("input");


    inputs.forEach((input) => {

        input.addEventListener("change", () => {

            const index =
                Number(input.dataset.index);

            const field =
                input.dataset.field;


            workoutResults[currentExerciseIndex]
                .series[index][field] =
                Number(input.value);

        });

    });


    const buttons =
        seriesList.querySelectorAll(
            ".complete-series-btn"
        );


    buttons.forEach((button) => {

    button.addEventListener("click", () => {

        const index =
            Number(button.dataset.index);

        const serie =
            workoutResults[currentExerciseIndex]
                .series[index];

        const wasCompleted =
            serie.concluida;

        serie.concluida =
            !serie.concluida;

        const isLastSeries =
            index ===
            workoutResults[currentExerciseIndex]
                .series.length - 1;


        /* Primeiro atualiza a interface */
        renderExercise();


        /* Depois inicia o descanso */
        if (!wasCompleted && !isLastSeries) {

            const seconds =
                workout.exercicios[
                    currentExerciseIndex
                ].descanso;

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

            if (serie.concluida) {
                completedSeries++;
            }

        });

    });


    const percentage =
        totalSeries === 0
            ? 0
            : Math.round(
                (completedSeries / totalSeries) * 100
            );


    progressFill.style.width =
        `${percentage}%`;


    progressText.textContent =
        `${percentage}%`;

}


/* ========================================
   DOTS
======================================== */

function renderDots() {

    dotsContainer.innerHTML = "";


    workout.exercicios.forEach((_, index) => {

        const dot =
            document.createElement("button");


        dot.type = "button";

        dot.classList.add("exercise-dot");


        if (index === currentExerciseIndex) {
            dot.classList.add("active");
        }


        const result =
            workoutResults[index];


        const completed =
            result.series.every(
                (serie) => serie.concluida
            );


        if (completed) {
            dot.classList.add("completed");
        }


        dot.addEventListener("click", () => {

    if (index === currentExerciseIndex) {
        return;
    }

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

    previousButton.disabled =
        currentExerciseIndex === 0;


    if (
        currentExerciseIndex ===
        workout.exercicios.length - 1
    ) {

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

    if (
        currentExerciseIndex <
        workout.exercicios.length - 1
    ) {

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


    const minutes =
        Math.floor(workoutSeconds / 60);

    const seconds =
        workoutSeconds % 60;


    document.getElementById(
        "workout-time"
    ).textContent =

        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


setInterval(updateTimer, 1000);

/* ========================================
   TIMER DE DESCANSO
======================================== */

function iniciarDescanso(seconds) {

    /*
        Se já existir um timer rodando,
        encerramos antes de iniciar outro.
    */

    pararDescanso();


    if (!seconds || seconds <= 0) {
        return;
    }


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


/* ========================================
   ATUALIZAR TIMER
======================================== */

function atualizarTimerDescanso() {

    const minutes =
        Math.floor(restSeconds / 60);

    const seconds =
        restSeconds % 60;


    restTime.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    const percentage =
        restTotalSeconds === 0
            ? 0
            : (restSeconds / restTotalSeconds) * 100;


    restProgress.style.width =
        `${percentage}%`;

}


/* ========================================
   PARAR DESCANSO
======================================== */

function pararDescanso() {

    if (restInterval) {

        clearInterval(restInterval);

        restInterval = null;

    }


    restTimer.style.display = "none";

}


/* ========================================
   PULAR DESCANSO
======================================== */

skipRestButton.addEventListener("click", () => {

    pararDescanso();

});


/* ========================================
   FINALIZAR
======================================== */

function finalizarTreino() {

    let totalSeries = 0;
    let completedSeries = 0;


    workoutResults.forEach((exercise) => {

        exercise.series.forEach((serie) => {

            totalSeries++;

            if (serie.concluida) {
                completedSeries++;
            }

        });

    });


    if (completedSeries < totalSeries) {

        const confirmFinish =
            confirm(
                `Você concluiu ${completedSeries} de ${totalSeries} séries. Deseja finalizar mesmo assim?`
            );


        if (!confirmFinish) {
            return;
        }

    }


    const workoutData = {

        treinoId: workout.id,

        duracaoSegundos: workoutSeconds,

        exercicios: workoutResults

    };


    console.log(
        "Resultado do treino pronto para API:",
        workoutData
    );


    alert("Treino finalizado! Mandou bem! 💪");


    window.location.href =
        "dashboard.html";

}


finishButton.addEventListener(
    "click",
    finalizarTreino
);




/* ========================================
   INICIALIZAÇÃO
======================================== */

renderExercise();

lucide.createIcons();