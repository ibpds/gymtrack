# 🏋️ GymTrack — Sistema de acompanhamento de treinos

**Problema:** quem treina normalmente registra cargas, séries e repetições de
forma desorganizada ou nem registra. O GymTrack permite montar treinos e
acompanhar a evolução em cada exercício.

## MVP do trabalho

- Cadastro de usuário e login
- Cadastro de exercícios
- Criação de treinos, como "Treino A — Pernas" e "Treino B — Superior"
- Associação de exercícios aos treinos (séries, repetições, carga planejada)
- Registro de cada treino realizado (execução)
- Registro de carga, séries e repetições realmente feitos
- Histórico de desempenho por exercício
- Dashboard com resumo da evolução
- 🏆 Recorde pessoal (PR): se a carga registrada supera o recorde anterior do
  usuário naquele exercício, a API sinaliza automaticamente um novo recorde

## Modelo de dados

```
USUARIO
   │
   ├──── TREINO
   │       │
   │       └──── TREINO_EXERCICIO ──── EXERCICIO
   │
   └──── EXECUCAO_TREINO
                │
                └──── EXECUCAO_EXERCICIO ──── EXERCICIO
```

Exemplo:

**Treino A — Pernas**
- Agachamento — 4 séries × 10 repetições — carga planejada: 50 kg
- Leg Press — 4 séries × 12 repetições — carga planejada: 100 kg

Depois do treino, o usuário registra o que realmente fez:

**02/09/2026**
- Agachamento: 4×10 — 55 kg
- Leg Press: 4×12 — 110 kg

E a API retorna a evolução de carga:

```
GET /progresso/1?usuario_id=1
01/08 → 40 kg
10/08 → 45 kg
20/08 → 50 kg
02/09 → 55 kg
```

No frontend, isso vira um gráfico de evolução da carga. 📈

## Endpoints da API

```
/usuarios
POST /usuarios

/login
POST /login

/exercicios
GET    /exercicios
GET    /exercicios/{id}
POST   /exercicios
PUT    /exercicios/{id}
DELETE /exercicios/{id}

/treinos
GET    /treinos?usuario_id=
GET    /treinos/{id}
POST   /treinos
PUT    /treinos/{id}
DELETE /treinos/{id}
POST   /treinos/{id}/exercicios      (associa um exercício ao treino)

/execucoes
POST /execucoes                      (registra um treino realizado + calcula PR)
GET  /execucoes?usuario_id=

/progresso
GET /progresso/{exercicio_id}?usuario_id=
GET /dashboard/{usuario_id}
```

## Stack

- **Backend:** Python + FastAPI
- **Banco:** **SQLite**
- **ORM:** SQLAlchemy
- **Frontend:** HTML + CSS + JavaScript puro, consumindo os endpoints da API
- **API:** REST + JSON

## Aderência aos requisitos do CP4

- [x] FastAPI para a API
- [x] Backend em pelo menos duas camadas: **Controller** e **Service**
- [x] SQLite como banco de dados
- [x] Pelo menos dois modelos relacionados (o projeto tem seis: Usuario,
      Treino, Exercicio, TreinoExercicio, ExecucaoTreino, ExecucaoExercicio)
- [x] CRUD completo (criação, consulta, atualização, remoção)
- [x] Interface em HTML e CSS que consome a API
- [x] Persistência dos dados no SQLite
