/* ========================================
   ELEMENTOS
======================================== */

const profileForm =
    document.getElementById("profile-form");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const goalSelect =
    document.getElementById("goal");

const levelSelect =
    document.getElementById("level");

const profileName =
    document.getElementById("profile-name");

const profileEmail =
    document.getElementById("profile-email");

const profileInitials =
    document.getElementById("profile-initials");

const cancelButton =
    document.getElementById("cancel-profile");

const changePasswordButton =
    document.getElementById("change-password");

const deleteAccountButton =
    document.getElementById("delete-account");


/* ========================================
   DADOS INICIAIS
======================================== */

const initialProfile = {

    name: nameInput.value,

    email: emailInput.value,

    goal: goalSelect.value,

    level: levelSelect.value

};


/* ========================================
   INICIAIS
======================================== */

function getInitials(name) {

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (parts.length === 0) {
        return "?";
    }


    if (parts.length === 1) {
        return parts[0]
            .charAt(0)
            .toUpperCase();
    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();

}


/* ========================================
   ATUALIZAR RESUMO
======================================== */

function updateProfileSummary() {

    profileName.textContent =
        nameInput.value.trim() ||
        "Usuário";

    profileEmail.textContent =
        emailInput.value.trim();

    profileInitials.textContent =
        getInitials(nameInput.value);

}


/* ========================================
   SALVAR
======================================== */

profileForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const profileData = {

            nome:
                nameInput.value.trim(),

            email:
                emailInput.value.trim(),

            objetivo:
                goalSelect.value,

            nivel:
                levelSelect.value

        };


        console.log(
            "Perfil pronto para API:",
            profileData
        );


        /*
            Futuramente:

            await apiRequest("/perfil", {

                method: "PUT",

                body: JSON.stringify(
                    profileData
                )

            });
        */


        updateProfileSummary();
        updateProfileBadges();


        alert(
            "Perfil atualizado com sucesso!"
        );

    }
);


/* ========================================
   CANCELAR ALTERAÇÕES
======================================== */

cancelButton.addEventListener(
    "click",
    () => {

        nameInput.value =
            initialProfile.name;

        emailInput.value =
            initialProfile.email;

        goalSelect.value =
            initialProfile.goal;

        levelSelect.value =
            initialProfile.level;


        updateProfileSummary();
        updateProfileBadges();

    }
);


/* ========================================
   ALTERAR SENHA
======================================== */

changePasswordButton.addEventListener(
    "click",
    () => {

        /*
            Depois podemos transformar
            isso em um modal.
        */

        alert(
            "A alteração de senha será conectada à API."
        );

    }
);


/* ========================================
   EXCLUIR CONTA
======================================== */

deleteAccountButton.addEventListener(
    "click",
    () => {

        const confirmed =
            confirm(
                "Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita."
            );


        if (!confirmed) {
            return;
        }


        /*
            Futuramente:

            await apiRequest("/perfil", {
                method: "DELETE"
            });
        */


        console.log(
            "Solicitação de exclusão da conta."
        );

    }
);


/* ========================================
   ATUALIZAÇÃO VISUAL
======================================== */

nameInput.addEventListener(
    "input",
    updateProfileSummary
);

emailInput.addEventListener(
    "input",
    updateProfileSummary
);

const levelBadge =
    document.getElementById("profile-level-badge");

const goalBadge =
    document.getElementById("profile-goal-badge");

function updateProfileBadges() {

    const selectedLevel =
        levelSelect.options[
            levelSelect.selectedIndex
        ].text;

    const selectedGoal =
        goalSelect.options[
            goalSelect.selectedIndex
        ].text;

    levelBadge.textContent =
        selectedLevel;

    goalBadge.textContent =
        selectedGoal;
}


/* ========================================
   INICIALIZAÇÃO
======================================== */

updateProfileSummary();
updateProfileBadges();
lucide.createIcons();