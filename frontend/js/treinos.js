/* ========================================
   ELEMENTOS
======================================== */

const workoutsGrid =
    document.getElementById(
        "workouts-grid"
    );

const workoutsCount =
    document.getElementById(
        "workouts-count"
    );


/* ========================================
   RENDERIZAR TREINOS
======================================== */

function renderWorkouts() {

    const workouts =
        GymTrackStorage.getWorkouts();


    workoutsGrid.innerHTML = "";


    workoutsCount.textContent =
        `${workouts.length} ${
            workouts.length === 1
                ? "treino"
                : "treinos"
        }`;


    if (workouts.length === 0) {

        workoutsGrid.innerHTML = `

            <div class="workouts-empty">

                <i data-lucide="dumbbell"></i>

                <h3>
                    Nenhum treino criado
                </h3>

                <p>
                    Crie sua primeira ficha para começar.
                </p>

                <a
                    href="treino-form.html"
                    class="new-workout-btn"
                >
                    <i data-lucide="plus"></i>
                    Novo treino
                </a>

            </div>

        `;


        lucide.createIcons();

        return;
    }


    workouts.forEach(
        (workout, index) => {

            const card =
                createWorkoutCard(
                    workout,
                    index
                );


            workoutsGrid.appendChild(
                card
            );

        }
    );


    addWorkoutEvents();

    lucide.createIcons();

}


/* ========================================
   CRIAR CARD
======================================== */

function createWorkoutCard(
    workout,
    index
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "workout-card";


    const preview =
        workout.exercicios
            .slice(0, 3)
            .map(
                exercise =>
                    `<span>${exercise.nome}</span>`
            )
            .join("");


    const remaining =
        workout.exercicios.length - 3;


    article.innerHTML = `

        <div class="workout-card-header">

            <span class="workout-label">
                TREINO ${getWorkoutLetter(index)}
            </span>


            <div class="workout-actions">

                <button
                    type="button"
                    class="workout-menu"
                    aria-label="Opções do treino"
                >
                    <i data-lucide="ellipsis-vertical"></i>
                </button>


                <div class="workout-dropdown">

                    <a
                        href="treino-form.html?id=${workout.id}"
                        class="dropdown-item"
                    >
                        <i data-lucide="pencil"></i>
                        Editar
                    </a>


                    <button
                        type="button"
                        class="dropdown-item delete"
                        data-delete-id="${workout.id}"
                    >
                        <i data-lucide="trash-2"></i>
                        Excluir
                    </button>

                </div>

            </div>

        </div>


        <div class="workout-card-title">

            <h3>
                ${workout.nome}
            </h3>

            <p>
                ${workout.descricao ||
                "Sem descrição."}
            </p>

        </div>


        <div class="workout-info">

            <span>
                <i data-lucide="list"></i>

                ${workout.exercicios.length}
                ${
                    workout.exercicios.length === 1
                        ? "exercício"
                        : "exercícios"
                }
            </span>


            <span>
                <i data-lucide="clock"></i>

                ~${workout.duracaoEstimada || 0} min
            </span>

        </div>


        <div class="exercise-preview">

            ${preview}

            ${
                remaining > 0
                    ? `
                        <span class="more-exercises">
                            +${remaining} ${
                                remaining === 1
                                    ? "exercício"
                                    : "exercícios"
                            }
                        </span>
                    `
                    : ""
            }

        </div>


        <a
            href="realizar-treino.html?id=${workout.id}"
            class="workout-start"
        >
            <i data-lucide="play"></i>
            Iniciar treino
        </a>

    `;


    return article;

}


/* ========================================
   LETRA DO TREINO
======================================== */

function getWorkoutLetter(index) {

    return String.fromCharCode(
        65 + index
    );

}


/* ========================================
   EVENTOS
======================================== */

function addWorkoutEvents() {

    const menuButtons =
        document.querySelectorAll(
            ".workout-menu"
        );


    menuButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();


                    const dropdown =
                        button.nextElementSibling;


                    document
                        .querySelectorAll(
                            ".workout-dropdown.open"
                        )
                        .forEach(
                            item => {

                                if (
                                    item !== dropdown
                                ) {
                                    item.classList.remove(
                                        "open"
                                    );
                                }

                            }
                        );


                    dropdown.classList.toggle(
                        "open"
                    );

                }
            );

        }
    );


    const deleteButtons =
        document.querySelectorAll(
            "[data-delete-id]"
        );


    deleteButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.deleteId;


                    const workout =
                        GymTrackStorage
                            .getWorkoutById(id);


                    if (!workout) {
                        return;
                    }


                    const confirmed =
                        confirm(
                            `Excluir o treino "${workout.nome}"?`
                        );


                    if (!confirmed) {
                        return;
                    }


                    GymTrackStorage
                        .deleteWorkout(id);


                    renderWorkouts();

                }
            );

        }
    );

}


/* ========================================
   FECHAR MENU
======================================== */

document.addEventListener(
    "click",
    () => {

        document
            .querySelectorAll(
                ".workout-dropdown.open"
            )
            .forEach(
                dropdown =>
                    dropdown.classList.remove(
                        "open"
                    )
            );

    }
);


/* ========================================
   INICIALIZAÇÃO
======================================== */

renderWorkouts();