const exercisesList = document.getElementById("exercises-list");
const emptyState = document.getElementById("empty-exercises");

const addExerciseButton = document.getElementById("add-exercise");
const emptyAddButton = document.getElementById("empty-add-exercise");

const workoutForm = document.getElementById("workout-form");


let exerciseCounter = 0;


/* ========================================
   ADICIONAR EXERCÍCIO
======================================== */

function adicionarExercicio() {

    exerciseCounter++;

    const exercise = document.createElement("article");

    exercise.classList.add("exercise-card");

    exercise.innerHTML = `

        <div class="exercise-header">

            <div class="exercise-number">
                <span>${String(exerciseCounter).padStart(2, "0")}</span>
            </div>

            <div class="exercise-title">
                <span>EXERCÍCIO</span>
                <strong>Novo exercício</strong>
            </div>

            <button
                type="button"
                class="remove-exercise"
                aria-label="Remover exercício"
            >
                <i data-lucide="trash-2"></i>
            </button>

        </div>


        <div class="exercise-fields">

            <div class="form-group exercise-name-field">

                <label>
                    Exercício
                </label>

                <input
                    type="text"
                    class="exercise-name"
                    placeholder="Ex.: Agachamento"
                    required
                >

            </div>


            <div class="form-group">

                <label>
                    Séries
                </label>

                <input
                    type="number"
                    class="exercise-series"
                    min="1"
                    placeholder="4"
                    required
                >

            </div>


            <div class="form-group">

                <label>
                    Repetições
                </label>

                <input
                    type="number"
                    class="exercise-reps"
                    min="1"
                    placeholder="10"
                    required
                >

            </div>


            <div class="form-group">

                <label>
                    Carga
                </label>

                <div class="input-unit">

                    <input
                        type="number"
                        class="exercise-weight"
                        min="0"
                        step="0.5"
                        placeholder="40"
                    >

                    <span>kg</span>

                </div>

            </div>


            <div class="form-group">

                <label>
                    Descanso
                </label>

                <div class="input-unit">

                    <input
                        type="number"
                        class="exercise-rest"
                        min="0"
                        placeholder="60"
                    >

                    <span>seg</span>

                </div>

            </div>


            <div class="form-group exercise-notes-field">

                <label>
                    Observações
                    <span>opcional</span>
                </label>

                <input
                    type="text"
                    class="exercise-notes"
                    placeholder="Ex.: aumentar carga na próxima sessão"
                >

            </div>

        </div>

    `;


    exercisesList.appendChild(exercise);


    /* Atualiza nome mostrado no cabeçalho */

    const nameInput =
        exercise.querySelector(".exercise-name");

    const title =
        exercise.querySelector(".exercise-title strong");


    nameInput.addEventListener("input", () => {

        title.textContent =
            nameInput.value.trim() || "Novo exercício";

    });


    /* Remover */

    const removeButton =
        exercise.querySelector(".remove-exercise");


    removeButton.addEventListener("click", () => {

        exercise.remove();

        atualizarExercicios();

    });


    atualizarExercicios();

    lucide.createIcons();


    /* Coloca cursor no exercício novo */

    nameInput.focus();
}


/* ========================================
   ATUALIZAR LISTA
======================================== */

function atualizarExercicios() {

    const exercises =
        document.querySelectorAll(".exercise-card");

    const hasExercises = exercises.length > 0;

    emptyState.style.display =
        hasExercises ? "none" : "flex";

    addExerciseButton.style.display =
        hasExercises ? "flex" : "none";

    exercises.forEach((exercise, index) => {

        const number =
            exercise.querySelector(".exercise-number span");

        number.textContent =
            String(index + 1).padStart(2, "0");
    });

    exerciseCounter = exercises.length;
}

/* ========================================
   EVENTOS
======================================== */

addExerciseButton.addEventListener(
    "click",
    adicionarExercicio
);


emptyAddButton.addEventListener(
    "click",
    adicionarExercicio
);


/* ========================================
   SALVAR TREINO
======================================== */

workoutForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const exerciseCards =
        document.querySelectorAll(".exercise-card");


    if (exerciseCards.length === 0) {

        alert("Adicione pelo menos um exercício ao treino.");

        return;
    }


    const exercises =
        Array.from(exerciseCards).map((exercise) => {

            return {

                nome:
                    exercise.querySelector(
                        ".exercise-name"
                    ).value,

                series:
                    Number(
                        exercise.querySelector(
                            ".exercise-series"
                        ).value
                    ),

                repeticoes:
                    Number(
                        exercise.querySelector(
                            ".exercise-reps"
                        ).value
                    ),

                carga:
                    Number(
                        exercise.querySelector(
                            ".exercise-weight"
                        ).value
                    ) || 0,

                descanso:
                    Number(
                        exercise.querySelector(
                            ".exercise-rest"
                        ).value
                    ) || 0,

                observacao:
                    exercise.querySelector(
                        ".exercise-notes"
                    ).value

            };

        });


    const workout = {

        nome:
            document.getElementById(
                "workout-name"
            ).value,

        descricao:
            document.getElementById(
                "workout-description"
            ).value,

        duracaoEstimada:
            Number(
                document.getElementById(
                    "workout-duration"
                ).value
            ) || null,

        exercicios: exercises

    };


    console.log("Treino pronto para API:", workout);


    /*
        FUTURAMENTE:

        await apiRequest("/treinos", {
            method: "POST",
            body: JSON.stringify(workout)
        });
    */


    alert("Treino criado com sucesso!");

window.location.href = "treinos.html";

});

atualizarExercicios();

lucide.createIcons();