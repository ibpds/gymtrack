/**
 * GYMTRACK - Cliente de Integração com o Backend FastAPI & SQLite
 */

const GymTrackAPI = (function () {
    const BASE_URL = window.GYMTRACK_API_URL || "http://127.0.0.1:8000";
    const STORAGE_USER_KEY = "gymtrack_current_user";

    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        };

        try {
            const response = await fetch(url, config);

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = (data && data.detail) 
                    ? (typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail))
                    : `Erro na requisição (${response.status}): ${response.statusText}`;
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error);
            throw error;
        }
    }

    return {
        baseUrl: BASE_URL,
        request,

        // ====================
        // AUTENTICAÇÃO E SESSÃO
        // ====================
        auth: {
            async login(email, senha = "") {
                const res = await request("/login", {
                    method: "POST",
                    body: JSON.stringify({ email: email.trim(), senha: senha.trim() })
                });
                const user = {
                    id: res.usuario_id || res.id,
                    nome: res.nome,
                    email: res.email || email.trim(),
                    objetivo: res.objetivo || "Hipertrofia",
                    nivel: res.nivel || "Intermediário"
                };
                GymTrackAPI.auth.setCurrentUser(user);
                return user;
            },

            async register(nome, email, senha = "", objetivo = "Hipertrofia", nivel = "Intermediário") {
                const userCreated = await request("/usuarios", {
                    method: "POST",
                    body: JSON.stringify({
                        nome: nome.trim(),
                        email: email.trim(),
                        senha: senha.trim(),
                        objetivo,
                        nivel
                    })
                });
                GymTrackAPI.auth.setCurrentUser(userCreated);
                return userCreated;
            },

            getCurrentUser() {
                try {
                    const saved = localStorage.getItem(STORAGE_USER_KEY);
                    if (saved) {
                        return JSON.parse(saved);
                    }
                } catch (e) {
                    console.warn("Erro ao ler usuário salvo no localStorage", e);
                }
                // Usuário padrão de fallback (criado pelo seed)
                return {
                    id: 1,
                    nome: "João Silva",
                    email: "joao@email.com",
                    objetivo: "Hipertrofia",
                    nivel: "Intermediário"
                };
            },

            setCurrentUser(user) {
                localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
            },

            logout() {
                localStorage.removeItem(STORAGE_USER_KEY);
                const isInsidePages = window.location.pathname.includes("/pages/");
                window.location.href = isInsidePages ? "../index.html" : "./index.html";
            }
        },

        // ====================
        // USUÁRIOS & PERFIL
        // ====================
        usuarios: {
            async getById(id) {
                return await request(`/usuarios/${id}`);
            },
            async update(id, data) {
                const updated = await request(`/usuarios/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(data)
                });
                const current = GymTrackAPI.auth.getCurrentUser();
                if (current && current.id === id) {
                    GymTrackAPI.auth.setCurrentUser({ ...current, ...updated });
                }
                return updated;
            }
        },

        // ====================
        // EXERCÍCIOS
        // ====================
        exercicios: {
            async getAll() {
                return await request("/exercicios");
            },
            async getById(id) {
                return await request(`/exercicios/${id}`);
            },
            async create(data) {
                return await request("/exercicios", {
                    method: "POST",
                    body: JSON.stringify(data)
                });
            }
        },

        // ====================
        // TREINOS (FICHAS)
        // ====================
        treinos: {
            async getAll(usuarioId) {
                const uid = usuarioId || GymTrackAPI.auth.getCurrentUser().id;
                return await request(`/treinos?usuario_id=${uid}`);
            },
            async getById(id) {
                return await request(`/treinos/${id}`);
            },
            async create(data) {
                const user = GymTrackAPI.auth.getCurrentUser();
                const payload = {
                    ...data,
                    usuario_id: data.usuario_id || user.id
                };
                return await request("/treinos", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            },
            async update(id, data) {
                return await request(`/treinos/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(data)
                });
            },
            async delete(id) {
                return await request(`/treinos/${id}`, {
                    method: "DELETE"
                });
            }
        },

        // ====================
        // EXECUÇÕES (HISTÓRICO)
        // ====================
        execucoes: {
            async create(data) {
                const user = GymTrackAPI.auth.getCurrentUser();
                const payload = {
                    ...data,
                    usuario_id: data.usuario_id || user.id
                };
                return await request("/execucoes", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            },
            async getAll(usuarioId) {
                const uid = usuarioId || GymTrackAPI.auth.getCurrentUser().id;
                return await request(`/execucoes?usuario_id=${uid}`);
            }
        },

        // ====================
        // PROGRESSO & DASHBOARD
        // ====================
        progresso: {
            async getByExercicio(exercicioId, usuarioId) {
                const uid = usuarioId || GymTrackAPI.auth.getCurrentUser().id;
                return await request(`/progresso/${exercicioId}?usuario_id=${uid}`);
            },
            async getDashboard(usuarioId) {
                const uid = usuarioId || GymTrackAPI.auth.getCurrentUser().id;
                return await request(`/dashboard/${uid}`);
            }
        }
    };
})();

// Exporta globalmente para uso em todos os scripts
window.GymTrackAPI = GymTrackAPI;
