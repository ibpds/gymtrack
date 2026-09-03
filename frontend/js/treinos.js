const workoutsMock = [
    {
        id: 1,
        codigo: "Treino A",
        nome: "Pernas & Glúteos",
        quantidadeExercicios: 6,
        duracao: 55
    },

    {
        id: 2,
        codigo: "Treino B",
        nome: "Peito & Tríceps",
        quantidadeExercicios: 5,
        duracao: 50
    },

    {
        id: 3,
        codigo: "Treino C",
        nome: "Costas & Bíceps",
        quantidadeExercicios: 6,
        duracao: 60
    }
];


function atualizarQuantidadeTreinos() {

    const workoutCount =
        document.getElementById("workout-count");

    workoutCount.textContent =
        `${workoutsMock.length} treinos`;
}

const menuButtons = document.querySelectorAll(".workout-menu");

menuButtons.forEach((button) => {

    button.addEventListener("click", (event) => {

        event.stopPropagation();

        const dropdown =
            button.parentElement.querySelector(".workout-dropdown");

        // Fecha os outros menus
        document
            .querySelectorAll(".workout-dropdown")
            .forEach((menu) => {

                if (menu !== dropdown) {
                    menu.classList.remove("open");
                }

            });

        dropdown.classList.toggle("open");

        button.setAttribute(
            "aria-expanded",
            dropdown.classList.contains("open")
        );
    });

});


// Fecha o menu ao clicar fora
document.addEventListener("click", () => {

    document
        .querySelectorAll(".workout-dropdown")
        .forEach((menu) => {
            menu.classList.remove("open");
        });

});


atualizarQuantidadeTreinos();

lucide.createIcons();