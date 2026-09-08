/* ========================================
   ELEMENTOS
======================================== */

const workoutsGrid = document.getElementById("workouts-grid");
const workoutsCount = document.getElementById("workouts-count");

let cachedWorkouts = [];

/* ========================================
   RENDERIZAR TREINOS
======================================== */

async function renderWorkouts() {
    workoutsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted, #94a3b8);">
            <p>Carregando seus treinos...</p>
        </div>
    `;

    try {
        const user = GymTrackAPI.auth.getCurrentUser();
        cachedWorkouts = await GymTrackAPI.treinos.getAll(user.id);
        workoutsGrid.innerHTML = "";

        workoutsCount.textContent = `${cachedWorkouts.length} ${
            cachedWorkouts.length === 1 ? "treino" : "treinos"
        }`;

        if (cachedWorkouts.length === 0) {
            workoutsGrid.innerHTML = `
                <div class="workouts-empty">
                    <i data-lucide="dumbbell"></i>
                    <h3>Nenhum treino criado</h3>
                    <p>Crie sua primeira ficha para começar.</p>
                    <a href="treino-form.html" class="new-workout-btn">
                        <i data-lucide="plus"></i>
                        Novo treino
                    </a>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        cachedWorkouts.forEach((workout, index) => {
            const card = createWorkoutCard(workout, index);
            workoutsGrid.appendChild(card);
        });

        addWorkoutEvents();
        if (window.lucide) lucide.createIcons();
    } catch (error) {
        console.error("Erro ao carregar treinos:", error);
        workoutsGrid.innerHTML = `
            <div class="workouts-empty" style="color: #ef4444;">
                <i data-lucide="alert-circle"></i>
                <h3>Erro ao carregar treinos</h3>
                <p>Verifique se o backend Python está em execução em ${GymTrackAPI.baseUrl}</p>
                <button type="button" class="btn-primary" style="margin-top: 1rem;" onclick="renderWorkouts()">
                    Tentar novamente
                </button>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }
}

/* ========================================
   CRIAR CARD
======================================== */

function createWorkoutCard(workout, index) {
    const article = document.createElement("article");
    article.className = "workout-card";

    const exercicios = workout.exercicios || [];
    const preview = exercicios
        .slice(0, 3)
        .map(exercise => {
            const nome = exercise.nome || (exercise.exercicio && exercise.exercicio.nome) || exercise.exercicio_nome || "Exercício";
            return `<span>${nome}</span>`;
        })
        .join("");

    const remaining = exercicios.length - 3;

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
            <h3>${workout.nome}</h3>
            <p>${workout.descricao || "Sem descrição."}</p>
        </div>

        <div class="workout-info">
            <span>
                <i data-lucide="list"></i>
                ${exercicios.length} ${exercicios.length === 1 ? "exercício" : "exercícios"}
            </span>

            <span>
                <i data-lucide="clock"></i>
                ~${workout.duracao_estimada || workout.duracaoEstimada || 45} min
            </span>
        </div>

        <div class="exercise-preview">
            ${preview}
            ${
                remaining > 0
                    ? `
                        <span class="more-exercises">
                            +${remaining} ${remaining === 1 ? "exercício" : "exercícios"}
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
    return String.fromCharCode(65 + (index % 26));
}

/* ========================================
   EVENTOS
======================================== */

function addWorkoutEvents() {
    const menuButtons = document.querySelectorAll(".workout-menu");

    menuButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const dropdown = button.nextElementSibling;

            document
                .querySelectorAll(".workout-dropdown.open")
                .forEach(item => {
                    if (item !== dropdown) {
                        item.classList.remove("open");
                    }
                });

            dropdown.classList.toggle("open");
        });
    });

    const deleteButtons = document.querySelectorAll("[data-delete-id]");

    deleteButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const id = button.dataset.deleteId;
            const workout = cachedWorkouts.find(w => String(w.id) === String(id));

            if (!workout) return;

            const confirmed = confirm(`Excluir o treino "${workout.nome}" do banco de dados?`);
            if (!confirmed) return;

            try {
                await GymTrackAPI.treinos.delete(id);
                await renderWorkouts();
            } catch (err) {
                console.error("Erro ao deletar treino:", err);
                alert("Erro ao excluir o treino: " + err.message);
            }
        });
    });
}

/* ========================================
   FECHAR MENU AO CLICAR FORA
======================================== */

document.addEventListener("click", () => {
    document
        .querySelectorAll(".workout-dropdown.open")
        .forEach(dropdown => dropdown.classList.remove("open"));
});

const logoutBtn = document.querySelector(".nav-item.logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        GymTrackAPI.auth.logout();
    });
}

/* ========================================
   INICIALIZAÇÃO
======================================== */

renderWorkouts();