const dashboardData = {
    usuario: {
        nome: "Izabela"
    },

    resumo: {
        treinosSemana: 3,
        treinosMes: 12,
        sequenciaSemanas: 4,
        recordes: 5
    }
};


function carregarDashboard() {
    document.getElementById("user-name").textContent =
        dashboardData.usuario.nome;

    document.getElementById("workouts-week").textContent =
        dashboardData.resumo.treinosSemana;

    document.getElementById("workouts-month").textContent =
        dashboardData.resumo.treinosMes;

    document.getElementById("streak").textContent =
        dashboardData.resumo.sequenciaSemanas;

    document.getElementById("personal-records").textContent =
        dashboardData.resumo.recordes;
}


carregarDashboard();
lucide.createIcons();