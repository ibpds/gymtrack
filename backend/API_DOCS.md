# Documentação da API GymTrack

A API do GymTrack foi desenvolvida em **FastAPI**. Por padrão, a documentação interativa oficial e testável (Swagger UI) fica disponível acessando `http://localhost:8000/docs` quando o servidor está rodando. 

Abaixo está o detalhamento manual de cada endpoint para facilitar a criação do frontend.

---

## 👥 Usuários

### `POST /usuarios`
Cria um novo usuário.
- **Corpo da requisição (JSON):**
  ```json
  {
    "nome": "João da Silva",
    "email": "joao@email.com",
    "senha": "senha_opcional"
  }
  ```
- **Retorno:** Dados do usuário criado com seu `id`.

### `GET /usuarios`
Lista todos os usuários cadastrados.
- **Retorno:** Lista de objetos de usuários.

### `POST /login`
Realiza o login de um usuário (mock).
- **Corpo da requisição (JSON):**
  ```json
  {
    "email": "joao@email.com"
  }
  ```
- **Retorno:** Mensagem de sucesso e o `id` do usuário logado (ex: `{"mensagem": "Login bem-sucedido", "usuario_id": 1, "nome": "João"}`).

---

## 🏋️ Exercícios

### `GET /exercicios`
Lista todos os exercícios do sistema.
- **Retorno:** Lista de exercícios cadastrados.

### `GET /exercicios/{id}`
Busca os detalhes de um exercício específico.
- **Parâmetro da URL:** `id` do exercício.
- **Retorno:** Objeto com dados do exercício.

### `POST /exercicios`
Cria um novo exercício.
- **Corpo da requisição (JSON):**
  ```json
  {
    "nome": "Supino Reto",
    "grupo_muscular": "Peito"
  }
  ```
- **Retorno:** Exercício recém-criado com seu `id`.

---

## 📋 Treinos (Planejamento)

### `GET /treinos`
Lista todos os treinos.
- **Query Params:** Pode enviar `?usuario_id=1` para listar apenas os treinos criados por um usuário específico.
- **Retorno:** Lista de treinos, incluindo os exercícios planejados associados.

### `GET /treinos/{id}`
Busca os detalhes de um treino específico, com seus exercícios associados.
- **Parâmetro da URL:** `id` do treino.
- **Retorno:** Objeto do treino completo.

### `POST /treinos`
Cria um novo treino vazio para um usuário.
- **Corpo da requisição (JSON):**
  ```json
  {
    "nome": "Treino A - Peito e Tríceps",
    "usuario_id": 1
  }
  ```
- **Retorno:** O treino criado com `id`.

### `POST /treinos/{id}/exercicios`
Associa um exercício existente a um treino (cria a meta de séries/repetições/carga).
- **Parâmetro da URL:** `id` do treino.
- **Corpo da requisição (JSON):**
  ```json
  {
    "exercicio_id": 1,
    "series_planejadas": 4,
    "repeticoes_planejadas": 12,
    "carga_planejada": 60.5
  }
  ```
- **Retorno:** A associação do exercício ao treino salva com sucesso.

---

## 🚀 Execuções de Treinos (O que foi realmente feito)

### `POST /execucoes`
Registra a execução de um treino (o que o usuário realmente fez naquele dia). O backend automaticamente verifica as cargas e calcula se essa execução foi um **Recorde Pessoal (PR)**.
- **Corpo da requisição (JSON):**
  ```json
  {
    "treino_id": 1,
    "usuario_id": 1,
    "data_execucao": "2026-09-08",
    "exercicios": [
      {
        "exercicio_id": 1,
        "series_realizadas": 4,
        "repeticoes_realizadas": 10,
        "carga_realizada": 65.0
      }
    ]
  }
  ```
- **Retorno:** A execução do treino registrada com sucesso, indicando em `pr` se foi recorde ou não.

### `GET /execucoes`
Lista os históricos de treinos realizados por um usuário.
- **Query Params:** `?usuario_id=1` *(Obrigatório)*
- **Retorno:** Lista de execuções completas (histórico do que foi treinado).

---

## 📈 Progresso & Dashboard (Evolução)

### `GET /progresso/{exercicio_id}`
Retorna um histórico da evolução de cargas (maior carga puxada a cada dia) para um exercício específico de um usuário. Ideal para plotar em gráficos de linha.
- **Parâmetro da URL:** `exercicio_id`.
- **Query Params:** `?usuario_id=1` *(Obrigatório)*
- **Retorno:** Lista de datas e as respectivas cargas máximas.
  Exemplo: `[{"data": "2026-08-01", "carga_maxima": 40.0}, {"data": "2026-09-02", "carga_maxima": 45.0}]`

### `GET /dashboard/{usuario_id}`
Retorna um resumo de produtividade do usuário (Dashboard).
- **Parâmetro da URL:** `usuario_id`.
- **Retorno:** Objeto contendo estatísticas (ex: `{"total_treinos": 12, "total_prs": 3}`).
