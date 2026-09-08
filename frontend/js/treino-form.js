const exercisesList = document.getElementById("exercises-list");
const emptyState = document.getElementById("empty-exercises");

const addExerciseButton = document.getElementById("add-exercise");
const emptyAddButton = document.getElementById("empty-add-exercise");

const workoutForm = document.getElementById("workout-form");

const pageEyebrow = document.getElementById("page-eyebrow");
const pageTitle = document.getElementById("page-title");
const pageDescription = document.getElementById("page-description");
const saveBtnText = document.getElementById("save-btn-text");

let exerciseCounter = 0;

/* ========================================
   MODO EDIÇÃO
======================================== */

const urlParams = new URLSearchParams(window.location.search);
const editingWorkoutId = urlParams.get("id");

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

/* ========================================
   ADICIONAR EXERCÍCIO
======================================== */

function adicionarExercicio(exerciseData = null, shouldFocus = true) {
    exerciseCounter++;

    const exercise = document.createElement("article");
    exercise.classList.add("exercise-card");

    const nome = exerciseData?.nome || (exerciseData?.exercicio && exerciseData.exercicio.nome) || exerciseData?.exercicio_nome || "";
    const series = exerciseData?.series ?? exerciseData?.series_planejadas ?? 4;
    const reps = exerciseData?.repeticoes ?? exerciseData?.repeticoes_planejadas ?? 10;
    const carga = exerciseData?.carga ?? exerciseData?.carga_planejada ?? 0;
    const descanso = exerciseData?.descanso ?? 60;
    const observacao = exerciseData?.observacao ?? "";

    exercise.innerHTML = `
        <div class="exercise-header">
            <div class="exercise-number">
                <span>${String(exerciseCounter).padStart(2, "0")}</span>
            </div>

            <div class="exercise-title">
                <span>EXERCÍCIO</span>
                <strong>${escapeHtml(nome.trim()) || "Novo exercício"}</strong>
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
                <label>Exercício</label>
                <input
                    type="text"
                    class="exercise-name"
                    placeholder="Ex.: Supino Reto"
                    value="${escapeHtml(nome)}"
                    required
                >
            </div>

            <div class="form-group">
                <label>Séries</label>
                <input
                    type="number"
                    class="exercise-series"
                    min="1"
                    placeholder="4"
                    value="${escapeHtml(series)}"
                    required
                >
            </div>

            <div class="form-group">
                <label>Repetições</label>
                <input
                    type="number"
                    class="exercise-reps"
                    min="1"
                    placeholder="10"
                    value="${escapeHtml(reps)}"
                    required
                >
            </div>

            <div class="form-group">
                <label>Carga</label>
                <div class="input-unit">
                    <input
                        type="number"
                        class="exercise-weight"
                        min="0"
                        step="0.5"
                        placeholder="40"
                        value="${escapeHtml(carga)}"
                    >
                    <span>kg</span>
                </div>
            </div>

            <div class="form-group">
                <label>Descanso</label>
                <div class="input-unit">
                    <input
                        type="number"
                        class="exercise-rest"
                        min="0"
                        placeholder="60"
                        value="${escapeHtml(descanso)}"
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
                    value="${escapeHtml(observacao)}"
                >
            </div>
        </div>
    `;

    exercisesList.appendChild(exercise);

    const nameInput = exercise.querySelector(".exercise-name");
    const title = exercise.querySelector(".exercise-title strong");

    nameInput.addEventListener("input", () => {
        title.textContent = nameInput.value.trim() || "Novo exercício";
    });

    const removeButton = exercise.querySelector(".remove-exercise");
    removeButton.addEventListener("click", () => {
        exercise.remove();
        atualizarExercicios();
    });

    atualizarExercicios();
    if (window.lucide) lucide.createIcons();

    if (shouldFocus) {
        nameInput.focus();
    }
}

/* ========================================
   ATUALIZAR LISTA
======================================== */

function atualizarExercicios() {
    const exercises = document.querySelectorAll(".exercise-card");
    const hasExercises = exercises.length > 0;

    emptyState.style.display = hasExercises ? "none" : "flex";
    addExerciseButton.style.display = hasExercises ? "flex" : "none";

    exercises.forEach((exercise, index) => {
        const number = exercise.querySelector(".exercise-number span");
        number.textContent = String(index + 1).padStart(2, "0");
    });

    exerciseCounter = exercises.length;
}

/* ========================================
   EVENTOS
======================================== */

addExerciseButton.addEventListener("click", () => adicionarExercicio());
emptyAddButton.addEventListener("click", () => adicionarExercicio());

/* ========================================
   CARREGAR TREINO PARA EDIÇÃO
======================================== */

async function carregarTreinoParaEdicao() {
    try {
        const workout = await GymTrackAPI.treinos.getById(editingWorkoutId);

        if (!workout) {
            alert("Treino não encontrado.");
            window.location.href = "treinos.html";
            return;
        }

        pageEyebrow.textContent = "EDITAR TREINO";
        pageTitle.textContent = "Editar treino";
        pageDescription.textContent = "Atualize as informações e exercícios da sua ficha.";
        saveBtnText.textContent = "Salvar alterações";

        document.getElementById("workout-name").value = workout.nome || "";
        document.getElementById("workout-description").value = workout.descricao || "";
        document.getElementById("workout-duration").value = workout.duracao_estimada ?? workout.duracaoEstimada ?? "";

        exercisesList.innerHTML = "";
        (workout.exercicios || []).forEach((exercicio) => {
            adicionarExercicio(exercicio, false);
        });

        if (window.lucide) lucide.createIcons();
    } catch (err) {
        console.error("Erro ao carregar treino para edição:", err);
        alert("Erro ao buscar dados do treino: " + err.message);
        window.location.href = "treinos.html";
    }
}

/* ========================================
   SALVAR TREINO
======================================== */

workoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const exerciseCards = document.querySelectorAll(".exercise-card");

    if (exerciseCards.length === 0) {
        alert("Adicione pelo menos um exercício ao treino.");
        return;
    }

    const exercises = Array.from(exerciseCards).map((exercise) => {
        return {
            exercicio_nome: exercise.querySelector(".exercise-name").value.trim(),
            series_planejadas: Number(exercise.querySelector(".exercise-series").value) || 1,
            repeticoes_planejadas: Number(exercise.querySelector(".exercise-reps").value) || 1,
            carga_planejada: Number(exercise.querySelector(".exercise-weight").value) || 0,
            descanso: Number(exercise.querySelector(".exercise-rest").value) || 0,
            observacao: exercise.querySelector(".exercise-notes").value.trim()
        };
    });

    const user = GymTrackAPI.auth.getCurrentUser();
    const workoutPayload = {
        nome: document.getElementById("workout-name").value.trim(),
        descricao: document.getElementById("workout-description").value.trim(),
        duracao_estimada: Number(document.getElementById("workout-duration").value) || 0,
        usuario_id: user.id,
        exercicios: exercises
    };

    saveBtnText.textContent = "Salvando...";

    try {
        if (editingWorkoutId) {
            await GymTrackAPI.treinos.update(editingWorkoutId, workoutPayload);
            alert("Treino atualizado com sucesso no banco de dados!");
        } else {
            await GymTrackAPI.treinos.create(workoutPayload);
            alert("Treino criado e salvo no banco de dados com sucesso!");
        }

        window.location.href = "treinos.html";
    } catch (error) {
        console.error("Erro ao salvar treino:", error);
        alert("Erro ao salvar treino no backend: " + error.message);
        saveBtnText.textContent = editingWorkoutId ? "Salvar alterações" : "Salvar treino";
    }
});

/* ========================================
   INICIALIZAÇÃO
======================================== */

if (editingWorkoutId) {
    carregarTreinoParaEdicao();
} else {
    atualizarExercicios();
}

if (window.lucide) lucide.createIcons();
