# Documentação da API GymTrack

A API do GymTrack foi desenvolvida em **FastAPI** com banco de dados **SQLite** e ORM **SQLAlchemy**. A documentação interativa oficial (Swagger UI) fica disponível acessando `http://localhost:8000/docs` quando o servidor está em execução.

Abaixo está o detalhamento de todos os endpoints REST do sistema.

---

## 👥 Usuários & Perfil

### `POST /usuarios`
Cria um novo usuário.
- **Corpo da requisição (JSON):**
  ```json
  {
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "123",
    "objetivo": "Hipertrofia",
    "nivel": "Intermediário"
  }
  ```
- **Retorno:** Objeto do usuário criado com seu `id`.

### `GET /usuarios`
Lista todos os usuários cadastrados.
- **Retorno:** Lista de objetos de usuários.

### `GET /usuarios/{id}`
Retorna os dados do perfil de um usuário específico.
- **Parâmetro da URL:** `id` do usuário.
- **Retorno:** Dados completos do usuário.

### `PUT /usuarios/{id}`
Atualiza dados cadastrais ou objetivos do perfil do usuário.
- **Parâmetro da URL:** `id` do usuário.
- **Corpo da requisição (JSON):** Campos opcionais (`nome`, `email`, `senha`, `objetivo`, `nivel`).
- **Retorno:** Objeto atualizado do usuário.

### `POST /login`
Realiza a autenticação do usuário.
- **Corpo da requisição (JSON):**
  ```json
  {
    "email": "joao@email.com",
    "senha": "123"
  }
  ```
- **Retorno:** Confirmação com dados do usuário autenticado:
  ```json
  {
    "mensagem": "Login bem-sucedido",
    "usuario_id": 1,
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "objetivo": "Hipertrofia",
    "nivel": "Intermediário"
  }
  ```

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
Cadastra um novo exercício.
- **Corpo da requisição (JSON):**
  ```json
  {
    "nome": "Supino Reto",
    "grupo_muscular": "Peito"
  }
  ```
- **Retorno:** Exercício recém-criado com seu `id`.

### `PUT /exercicios/{id}`
Atualiza informações de um exercício.
- **Parâmetro da URL:** `id` do exercício.

### `DELETE /exercicios/{id}`
Exclui um exercício do sistema.
- **Parâmetro da URL:** `id` do exercício.

---

## 📋 Treinos (Planejamento)

### `GET /treinos`
Lista todos os treinos.
- **Query Params:** `?usuario_id=1` para listar apenas os treinos daquele usuário.
- **Retorno:** Lista de treinos com seus exercícios planejados associados.

### `GET /treinos/{id}`
Busca os detalhes de um treino específico, incluindo a lista de exercícios.
- **Parâmetro da URL:** `id` do treino.
- **Retorno:** Objeto do treino completo.

### `POST /treinos`
Cria um novo treino para um usuário (pode incluir lista de exercícios diretamente).
- **Corpo da requisição (JSON):**
  ```json
  {
    "nome": "Treino A - Pernas & Glúteos",
    "descricao": "Foco em quadríceps e glúteos",
    "duracao_estimada": 55,
    "usuario_id": 1,
    "exercicios": [
      {
        "exercicio_nome": "Agachamento",
        "series_planejadas": 4,
        "repeticoes_planejadas": 10,
        "carga_planejada": 40.0,
        "descanso": 60,
        "observacao": "Manter a postura"
      }
    ]
  }
  ```
- **Retorno:** O treino criado com seu `id` e exercícios persistidos.

### `PUT /treinos/{id}`
Atualiza os dados de um treino e sua lista de exercícios planejados.
- **Parâmetro da URL:** `id` do treino.
- **Corpo da requisição (JSON):** Mesma estrutura do `POST /treinos`.
- **Retorno:** Treino atualizado.

### `DELETE /treinos/{id}`
Exclui um treino do banco de dados (e suas associações de exercícios em cascata).
- **Parâmetro da URL:** `id` do treino.
- **Retorno:** Mensagem de sucesso.

### `POST /treinos/{id}/exercicios`
Associa um exercício a um treino existente.
- **Parâmetro da URL:** `id` do treino.
- **Corpo da requisição (JSON):**
  ```json
  {
    "exercicio_id": 1,
    "series_planejadas": 4,
    "repeticoes_planejadas": 12,
    "carga_planejada": 60.5,
    "descanso": 60,
    "observacao": ""
  }
  ```

---

## 🚀 Execuções de Treinos (Histórico Real)

### `POST /execucoes`
Registra a execução de um treino realizado pelo usuário. O backend compara automaticamente as cargas com o histórico do usuário e calcula se a execução bateu um **Recorde Pessoal (PR)** (`pr = 1`).
- **Corpo da requisição (JSON):**
  ```json
  {
    "treino_id": 1,
    "usuario_id": 1,
    "data_execucao": "2026-09-08",
    "duracao_segundos": 3300,
    "exercicios": [
      {
        "exercicio_id": 1,
        "series_realizadas": 4,
        "repeticoes_realizadas": 10,
        "carga_realizada": 45.0
      }
    ]
  }
  ```
- **Retorno:** Execução registrada com `pr` sinalizado nos exercícios.

### `GET /execucoes`
Lista o histórico completo de treinos realizados por um usuário.
- **Query Params:** `?usuario_id=1` *(Obrigatório)*
- **Retorno:** Lista de execuções ordenadas cronologicamente com dados dos exercícios e do treino.

---

## 📈 Progresso & Dashboard (Evolução)

### `GET /progresso/{exercicio_id}`
Retorna a evolução temporal de cargas máximas para um determinado exercício.
- **Parâmetro da URL:** `exercicio_id`.
- **Query Params:** `?usuario_id=1` *(Obrigatório)*
- **Retorno:** Lista com pares de data e carga máxima atingida.

### `GET /dashboard/{usuario_id}`
Retorna o resumo geral de produtividade do usuário (total de treinos, recordes pessoais PRs batidos e volume total de carga levantada).
- **Parâmetro da URL:** `usuario_id`.
- **Retorno:**
  ```json
  {
    "total_treinos": 8,
    "total_prs": 20,
    "total_volume": 7468.0
  }
  ```
