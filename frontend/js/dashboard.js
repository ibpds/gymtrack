(function () {

/* ========================================
   ELEMENTOS
======================================== */

const greetingEl =
    document.getElementById("dashboard-greeting");

const workoutsWeekEl =
    document.getElementById("workouts-week");

const weeklyVolumeEl =
    document.getElementById("weekly-volume");

const streakEl =
    document.getElementById("streak");

const weeklyDurationEl =
    document.getElementById("weekly-duration");

const weekDaysEl =
    document.getElementById("week-days");

const weekSummaryCountEl =
    document.getElementById("week-summary-count");

const nextWorkoutCardEl =
    document.getElementById("next-workout-card");

const lastWorkoutCardEl =
    document.getElementById("last-workout-card");

const userAvatarEl =
    document.getElementById("user-avatar");

const evolutionSubtitleEl =
    document.getElementById("evolution-subtitle");

const evolutionCardEl =
    document.getElementById("evolution-card");


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


function parseDate(value) {

    const date = new Date(value);

    return isNaN(date.getTime()) ? null : date;

}


function formatVolume(volume) {

    return `${Math.round(volume).toLocaleString("pt-BR")} kg`;

}


function formatDuration(seconds) {

    const totalMinutes =
        Math.round(toValidNumber(seconds) / 60);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${minutes} min`;
    }

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}min`;

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


function formatDateShort(isoString) {

    const date = parseDate(isoString);

    if (!date) {
        return "--";
    }

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");

    return `${dd}/${mm}`;

}


function normalizeExerciseKey(nome) {

    return String(nome || "").trim().toLowerCase();

}


/*
    Semana sempre SEGUNDA-FEIRA → DOMINGO,
    calculada com base no horário local
    (mesma regra usada em Progresso).
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


/* ========================================
   EVOLUÇÃO DE CARGA POR EXERCÍCIO
   (mesma regra da página Progresso)
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


/*
    Exercício em destaque no Dashboard = aquele cuja
    execução concluída é a MAIS RECENTE do histórico.
*/

function pickMostRecentExerciseKey(entries) {

    let mostRecent = null;

    entries.forEach((entry) => {

        const entryDate = parseDate(entry.data);

        if (!entryDate) {
            return;
        }

        if (!mostRecent || entryDate.getTime() > mostRecent.time) {
            mostRecent = { key: entry.key, time: entryDate.getTime() };
        }

    });

    return mostRecent ? mostRecent.key : null;

}


function getDashboardEvolution(history) {

    const entries =
        buildExerciseEntries(history);

    const selectedKey =
        pickMostRecentExerciseKey(entries);

    if (!selectedKey) {
        return null;
    }

    const grouped =
        groupEntriesByExercise(entries);

    const allPoints =
        grouped.get(selectedKey) || [];

    const points =
        allPoints.slice(-5);

    if (points.length === 0) {
        return null;
    }

    const displayName =
        points[points.length - 1].displayName;

    const atual =
        points[points.length - 1].carga;

    const inicialPeriodo =
        points[0].carga;

    return {
        displayName,
        atual,
        variacao: atual - inicialPeriodo,
        points
    };

}


function calculatePointPositions(points) {

    const cargas = points.map((point) => point.carga);

    const min = Math.min(...cargas);
    const max = Math.max(...cargas);

    const count = points.length;

    return points.map((point, index) => {

        const leftPercent =
            count === 1 ? 50 : 3 + (index / (count - 1)) * 94;

        const ratio =
            max === min ? 0.5 : (point.carga - min) / (max - min);

        const bottomPx = 5 + ratio * 90;

        return { ...point, leftPercent, bottomPx };

    });

}


function formatWeightDiff(diff) {

    const rounded = Math.round(diff * 10) / 10;

    if (rounded === 0) {
        return "0 kg";
    }

    const sign = rounded > 0 ? "+" : "-";

    return `${sign}${Math.abs(rounded)} kg`;

}


/* ========================================
   SESSÕES DA SEMANA
======================================== */

function getSessionsThisWeek(history) {

    const currentWeekKey =
        getWeekKey(new Date());

    return history.filter((session) => {

        const date = parseDate(session.realizadoEm);

        return date !== null && getWeekKey(date) === currentWeekKey;

    });

}


function calculateWeeklyVolume(sessions) {

    return sessions.reduce(
        (total, session) => total + calculateSessionVolume(session),
        0
    );

}


function calculateWeeklyDuration(sessions) {

    return sessions.reduce(
        (total, session) => total + toValidNumber(session.duracaoSegundos),
        0
    );

}


/* ========================================
   SEQUÊNCIA
   (mesma regra da página Progresso)
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
   ATIVIDADE DA SEMANA
======================================== */

function getWeeklyActivity(history) {

    const dayLabels = ["S", "T", "Q", "Q", "S", "S", "D"];

    const monday = getMonday(new Date());

    const counts = new Array(7).fill(0);

    history.forEach((session) => {

        const date = parseDate(session.realizadoEm);

        if (!date) {
            return;
        }

        const localDate =
            new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const diffDays =
            Math.round((localDate - monday) / 86400000);

        if (diffDays >= 0 && diffDays < 7) {
            counts[diffDays]++;
        }

    });

    return dayLabels.map((label, index) => ({
        label,
        count: counts[index],
        active: counts[index] > 0
    }));

}


/* ========================================
   ÚLTIMO TREINO
======================================== */

function getLastWorkoutSession(history) {

    if (history.length === 0) {
        return null;
    }

    const sorted =
        [...history].sort((a, b) => {

            const dateA = parseDate(a.realizadoEm);
            const dateB = parseDate(b.realizadoEm);

            return (dateB ? dateB.getTime() : 0) -
                (dateA ? dateA.getTime() : 0);

        });

    return sorted[0];

}


/* ========================================
   SUGESTÃO DE PRÓXIMO TREINO
======================================== */

function getSuggestedWorkout(workouts, history) {

    if (workouts.length === 0) {
        return null;
    }

    const lastSessionByWorkoutId = new Map();

    history.forEach((session) => {

        const date = parseDate(session.realizadoEm);

        if (!date) {
            return;
        }

        const existing =
            lastSessionByWorkoutId.get(session.treinoId);

        if (!existing || date.getTime() > existing.getTime()) {
            lastSessionByWorkoutId.set(session.treinoId, date);
        }

    });

    const neverDone = [];
    const alreadyDone = [];

    workouts.forEach((workout) => {

        const lastDate =
            lastSessionByWorkoutId.get(workout.id);

        if (lastDate) {
            alreadyDone.push({ workout, lastDate });
        } else {
            neverDone.push(workout);
        }

    });

    if (neverDone.length > 0) {
        return neverDone[0];
    }

    alreadyDone.sort(
        (a, b) => a.lastDate.getTime() - b.lastDate.getTime()
    );

    return alreadyDone.length > 0 ? alreadyDone[0].workout : null;

}


function buildExercisePreview(workout) {

    if (workout.descricao && workout.descricao.trim()) {
        return workout.descricao.trim();
    }

    const names =
        (workout.exercicios || [])
            .map((exercicio) => exercicio.nome)
            .filter(Boolean);

    if (names.length === 0) {
        return "Nenhum exercício cadastrado.";
    }

    const firstThree = names.slice(0, 3).join(", ");
    const remaining = names.length - 3;

    return remaining > 0
        ? `${firstThree} e mais ${remaining} ${remaining === 1 ? "exercício" : "exercícios"}.`
        : `${firstThree}.`;

}


/* ========================================
   RENDER — SAUDAÇÃO
======================================== */

function renderGreeting() {

    const profile =
        GymTrackStorage.getProfile();

    const name =
        profile && typeof profile.nome === "string"
            ? profile.nome.trim()
            : "";

    greetingEl.textContent =
        name ? `Olá, ${name}!` : "Olá!";

}


/* ========================================
   RENDER — AVATAR
======================================== */

const IGNORED_NAME_WORDS =
    new Set(["da", "de", "do", "das", "dos"]);


function getInitials(fullName) {

    const words =
        fullName
            .trim()
            .split(/\s+/)
            .filter(
                (word) =>
                    word.length > 0 &&
                    !IGNORED_NAME_WORDS.has(word.toLowerCase())
            );

    if (words.length === 0) {
        return "";
    }

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);

    return `${first}${last}`.toUpperCase();

}


function renderAvatar() {

    const profile =
        GymTrackStorage.getProfile();

    const name =
        profile && typeof profile.nome === "string"
            ? profile.nome.trim()
            : "";

    const initials =
        name ? getInitials(name) : "";

    if (initials) {

        userAvatarEl.textContent = initials;

    } else {

        userAvatarEl.innerHTML = '<i data-lucide="user"></i>';

    }

}


/* ========================================
   RENDER — RESUMO
======================================== */

function renderSummary({ workoutsWeek, weeklyVolume, streak, weeklyDurationSeconds }) {

    workoutsWeekEl.textContent =
        String(workoutsWeek);

    weeklyVolumeEl.textContent =
        formatVolume(weeklyVolume);

    streakEl.textContent =
        String(streak);

    weeklyDurationEl.textContent =
        formatDuration(weeklyDurationSeconds);

    weekSummaryCountEl.textContent =
        `${workoutsWeek} ${workoutsWeek === 1 ? "treino" : "treinos"}`;

}


/* ========================================
   RENDER — ATIVIDADE DA SEMANA
======================================== */

function renderWeeklyActivity(days) {

    weekDaysEl.innerHTML = "";

    days.forEach((day) => {

        const dayEl =
            document.createElement("div");

        dayEl.className =
            "day" + (day.active ? " completed" : "");

        dayEl.innerHTML = `
            <span>${escapeHtml(day.label)}</span>
            <div>${day.active ? '<i data-lucide="check"></i>' : ""}</div>
        `;

        weekDaysEl.appendChild(dayEl);

    });

}


/* ========================================
   RENDER — PRÓXIMO TREINO
======================================== */

function renderNextWorkout(workout, workouts) {

    if (!workout) {

        nextWorkoutCardEl.innerHTML = `

            <div class="workout-content">

                <h3>Nenhum treino cadastrado</h3>

                <p>
                    Você ainda não possui treinos cadastrados.
                </p>

            </div>

            <a href="treino-form.html" class="start-workout-btn">
                <i data-lucide="plus"></i>
                <span>Criar treino</span>
            </a>

        `;

        return;

    }

    const index =
        workouts.findIndex((item) => item.id === workout.id);

    const letter =
        String.fromCharCode(65 + (index >= 0 ? index : 0));

    const exerciseCount =
        (workout.exercicios || []).length;

    const previewText =
        buildExercisePreview(workout);

    nextWorkoutCardEl.innerHTML = `

        <div class="workout-top">

            <span class="workout-tag">
                PRÓXIMO
            </span>

            <span class="workout-code">
                TREINO ${letter}
            </span>

        </div>


        <div class="workout-content">

            <h3>${escapeHtml(workout.nome)}</h3>

            <p>${escapeHtml(previewText)}</p>

        </div>


        <div class="workout-meta">

            <span>
                <i data-lucide="list-checks"></i>
                ${exerciseCount} ${exerciseCount === 1 ? "exercício" : "exercícios"}
            </span>

            <span class="meta-divider"></span>

            <span>
                <i data-lucide="clock"></i>
                ~${toValidNumber(workout.duracaoEstimada)} min
            </span>

        </div>


        <a
            href="realizar-treino.html?id=${encodeURIComponent(workout.id)}"
            class="start-workout-btn"
        >
            <i data-lucide="play"></i>

            <span>
                Iniciar treino
            </span>
        </a>

    `;

}


/* ========================================
   RENDER — ÚLTIMO TREINO
======================================== */

function renderLastWorkout(session) {

    if (!session) {

        lastWorkoutCardEl.innerHTML = `

            <div class="last-workout-icon">
                <i data-lucide="dumbbell"></i>
            </div>

            <div class="last-workout-info">

                <strong>Você ainda não realizou nenhum treino.</strong>

                <div class="last-workout-meta">
                    <span class="last-workout-empty">
                        Finalize seu primeiro treino para vê-lo aqui.
                    </span>
                </div>

            </div>

        `;

        return;

    }

    const exerciseCount =
        (session.exercicios || []).length;

    const volume =
        calculateSessionVolume(session);

    lastWorkoutCardEl.innerHTML = `

        <div class="last-workout-icon">
            <i data-lucide="dumbbell"></i>
        </div>

        <div class="last-workout-info">

            <strong>${escapeHtml(session.treinoNome || "Treino")}</strong>

            <div class="last-workout-meta">

                <span>${formatSessionDate(session.realizadoEm)}</span>

                <span class="meta-divider"></span>

                <span>${formatDuration(session.duracaoSegundos)}</span>

                <span class="meta-divider"></span>

                <span>${exerciseCount} ${exerciseCount === 1 ? "exercício" : "exercícios"}</span>

                <span class="meta-divider"></span>

                <span>${formatVolume(volume)}</span>

            </div>

        </div>

    `;

}


/* ========================================
   RENDER — EVOLUÇÃO RECENTE
======================================== */

function renderEvolution(evolution) {

    if (!evolution) {

        evolutionSubtitleEl.textContent =
            "Sem dados de evolução ainda.";

        evolutionCardEl.innerHTML = `

            <div class="evolution-empty">

                <strong>Sem dados de evolução ainda.</strong>

                <span>
                    Finalize séries nos seus treinos para acompanhar sua evolução.
                </span>

            </div>

        `;

        return;

    }

    evolutionSubtitleEl.textContent =
        `Seu progresso em ${evolution.displayName}`;

    const positioned =
        calculatePointPositions(evolution.points);

    const pointsHtml =
        positioned
            .map(
                (point) =>
                    `<span class="point" style="left:${point.leftPercent}%;bottom:${point.bottomPx}px;"></span>`
            )
            .join("");

    const labelsHtml =
        positioned
            .map(
                (point) =>
                    `<span>${formatDateShort(point.data)}</span>`
            )
            .join("");

    evolutionCardEl.innerHTML = `

        <div class="progress-header">

            <div>

                <span class="progress-exercise">${escapeHtml(evolution.displayName)}</span>

                <strong>${evolution.atual} kg</strong>

            </div>


            <span class="progress-growth">

                <i data-lucide="trending-up"></i>

                ${formatWeightDiff(evolution.variacao)}

            </span>

        </div>


        <div class="chart-placeholder">

            <div class="chart-line">
                ${pointsHtml}
            </div>


            <div class="chart-labels">
                ${labelsHtml}
            </div>

        </div>

    `;

}


/* ========================================
   INICIALIZAÇÃO
======================================== */

function init() {

    const workouts =
        GymTrackStorage.getWorkouts();

    const history =
        GymTrackStorage.getHistory();


    renderGreeting();

    renderAvatar();


    const sessionsThisWeek =
        getSessionsThisWeek(history);

    const weeklyVolume =
        calculateWeeklyVolume(sessionsThisWeek);

    const weeklyDurationSeconds =
        calculateWeeklyDuration(sessionsThisWeek);

    const streak =
        calculateStreak(history);


    renderSummary({
        workoutsWeek: sessionsThisWeek.length,
        weeklyVolume,
        streak,
        weeklyDurationSeconds
    });


    renderWeeklyActivity(getWeeklyActivity(history));


    const suggestedWorkout =
        getSuggestedWorkout(workouts, history);

    renderNextWorkout(suggestedWorkout, workouts);


    const lastSession =
        getLastWorkoutSession(history);

    renderLastWorkout(lastSession);


    const evolution =
        getDashboardEvolution(history);

    renderEvolution(evolution);


    lucide.createIcons();

}


init();

})();
