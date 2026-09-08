/* ========================================
   ELEMENTOS
======================================== */

const profileForm = document.getElementById("profile-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const goalSelect = document.getElementById("goal");
const levelSelect = document.getElementById("level");

const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileInitials = document.getElementById("profile-initials");

const levelBadge = document.getElementById("profile-level-badge");
const goalBadge = document.getElementById("profile-goal-badge");

const cancelButton = document.getElementById("cancel-profile");
const changePasswordButton = document.getElementById("change-password");
const deleteAccountButton = document.getElementById("delete-account");

let currentUser = null;

/* ========================================
   INICIAIS
======================================== */

function getInitials(name) {
    const parts = (name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/* ========================================
   ATUALIZAR RESUMO VISUAL
======================================== */

function updateProfileSummary() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    profileName.textContent = name || "Usuário";
    profileEmail.textContent = email || "email@exemplo.com";
    profileInitials.textContent = getInitials(name);
}

function updateProfileBadges() {
    if (levelSelect.selectedIndex >= 0) {
        levelBadge.textContent = levelSelect.options[levelSelect.selectedIndex].text;
    }
    if (goalSelect.selectedIndex >= 0) {
        goalBadge.textContent = goalSelect.options[goalSelect.selectedIndex].text;
    }
}

/* ========================================
   CARREGAR DADOS DO USUÁRIO
======================================== */

async function carregarPerfil() {
    currentUser = GymTrackAPI.auth.getCurrentUser();

    try {
        if (currentUser && currentUser.id) {
            const freshUser = await GymTrackAPI.usuarios.getById(currentUser.id);
            if (freshUser) {
                currentUser = { ...currentUser, ...freshUser };
                GymTrackAPI.auth.setCurrentUser(currentUser);
            }
        }
    } catch (e) {
        console.warn("Não foi possível buscar perfil atualizado no backend, usando cache local", e);
    }

    if (!currentUser) {
        currentUser = {
            id: 1,
            nome: "João Silva",
            email: "joao@email.com",
            objetivo: "Hipertrofia",
            nivel: "Intermediário"
        };
    }

    nameInput.value = currentUser.nome || "";
    emailInput.value = currentUser.email || "";

    if (currentUser.objetivo) {
        for (let i = 0; i < goalSelect.options.length; i++) {
            if (goalSelect.options[i].value === currentUser.objetivo || goalSelect.options[i].text === currentUser.objetivo) {
                goalSelect.selectedIndex = i;
                break;
            }
        }
    }

    if (currentUser.nivel) {
        for (let i = 0; i < levelSelect.options.length; i++) {
            if (levelSelect.options[i].value === currentUser.nivel || levelSelect.options[i].text === currentUser.nivel) {
                levelSelect.selectedIndex = i;
                break;
            }
        }
    }

    updateProfileSummary();
    updateProfileBadges();
    if (window.lucide) lucide.createIcons();
}

/* ========================================
   SALVAR NO BACKEND
======================================== */

profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const saveButton = profileForm.querySelector("button[type='submit']");
    if (saveButton) saveButton.disabled = true;

    const profileData = {
        nome: nameInput.value.trim(),
        email: emailInput.value.trim(),
        objetivo: goalSelect.value,
        nivel: levelSelect.value
    };

    try {
        const updated = await GymTrackAPI.usuarios.update(currentUser.id, profileData);
        currentUser = { ...currentUser, ...updated };
        updateProfileSummary();
        updateProfileBadges();
        alert("Perfil salvo com sucesso no banco de dados SQLite!");
    } catch (err) {
        console.error("Erro ao salvar perfil:", err);
        alert("Erro ao salvar dados do perfil no backend: " + err.message);
    } finally {
        if (saveButton) saveButton.disabled = false;
    }
});

/* ========================================
   CANCELAR ALTERAÇÕES
======================================== */

cancelButton.addEventListener("click", () => {
    carregarPerfil();
});

/* ========================================
   ALTERAR SENHA
======================================== */

changePasswordButton.addEventListener("click", async () => {
    const novaSenha = prompt("Digite sua nova senha:");
    if (!novaSenha || !novaSenha.trim()) return;

    try {
        await GymTrackAPI.usuarios.update(currentUser.id, { senha: novaSenha.trim() });
        alert("Senha atualizada com sucesso no banco de dados!");
    } catch (err) {
        alert("Erro ao atualizar senha: " + err.message);
    }
});

/* ========================================
   EXCLUIR CONTA
======================================== */

deleteAccountButton.addEventListener("click", () => {
    alert("Para excluir sua conta definitivamente, entre em contato com o suporte ou administrador do sistema.");
});

/* ========================================
   LOGOUT
======================================== */

const logoutBtn = document.querySelector(".nav-item.logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        GymTrackAPI.auth.logout();
    });
}

/* ========================================
   ATUALIZAÇÃO VISUAL DINÂMICA
======================================== */

nameInput.addEventListener("input", updateProfileSummary);
emailInput.addEventListener("input", updateProfileSummary);
goalSelect.addEventListener("change", updateProfileBadges);
levelSelect.addEventListener("change", updateProfileBadges);

/* ========================================
   INICIALIZAÇÃO
======================================== */

carregarPerfil();