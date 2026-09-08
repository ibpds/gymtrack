const passwordInput = document.getElementById("password");
const passwordToggle = document.getElementById("password-toggle");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const nameGroup = document.getElementById("name-group");
const nameInput = document.getElementById("name");
const submitBtn = document.getElementById("submit-btn");
const submitBtnText = submitBtn.querySelector("span:first-child");
const toggleAuthMode = document.getElementById("toggle-auth-mode");
const togglePrompt = document.getElementById("toggle-prompt");
const authError = document.getElementById("auth-error");

let isRegisterMode = false;

// Alternar visibilidade de senha
passwordToggle.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    passwordToggle.setAttribute(
        "aria-label",
        isPassword ? "Ocultar senha" : "Mostrar senha"
    );
    passwordToggle.textContent = isPassword ? "Ocultar" : "Mostrar";
});

// Alternar entre Entrar e Criar conta
if (toggleAuthMode) {
    toggleAuthMode.addEventListener("click", (e) => {
        e.preventDefault();
        isRegisterMode = !isRegisterMode;
        authError.style.display = "none";

        if (isRegisterMode) {
            nameGroup.style.display = "block";
            nameInput.required = true;
            submitBtnText.textContent = "Criar conta";
            togglePrompt.textContent = "Já tem uma conta?";
            toggleAuthMode.textContent = "Entrar";
            document.querySelector(".login-header h2").textContent = "Criar sua conta";
            document.querySelector(".login-header p").textContent = "Preencha seus dados para começar a evoluir.";
        } else {
            nameGroup.style.display = "none";
            nameInput.required = false;
            submitBtnText.textContent = "Entrar";
            togglePrompt.textContent = "Ainda não tem uma conta?";
            toggleAuthMode.textContent = "Criar conta";
            document.querySelector(".login-header h2").textContent = "Bem-vindo de volta";
            document.querySelector(".login-header p").textContent = "Entre na sua conta para continuar evoluindo.";
        }
    });
}

// Submissão do formulário
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authError.style.display = "none";
    submitBtn.disabled = true;
    submitBtnText.textContent = isRegisterMode ? "Criando..." : "Entrando...";

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const name = nameInput ? nameInput.value.trim() : "";

    try {
        if (isRegisterMode) {
            if (!name) {
                throw new Error("Por favor, informe seu nome.");
            }
            await GymTrackAPI.auth.register(name, email, password);
        } else {
            await GymTrackAPI.auth.login(email, password);
        }

        // Sucesso -> redireciona para o dashboard
        window.location.href = "./pages/dashboard.html";
    } catch (err) {
        console.error("Erro na autenticação:", err);
        authError.textContent = err.message || "Falha ao conectar com o servidor. Verifique se o backend está rodando.";
        authError.style.display = "block";
    } finally {
        submitBtn.disabled = false;
        submitBtnText.textContent = isRegisterMode ? "Criar conta" : "Entrar";
    }
});