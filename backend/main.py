# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.controller import router
from backend import models, service
from backend.database import engine, SessionLocal

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cria tabelas se não existirem
    models.Base.metadata.create_all(bind=engine)
    # Executa seed inicial de dados se o banco estiver vazio
    db = SessionLocal()
    try:
        service.seed_db(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="GymTrack API",
    version="1.0.0",
    description="API do GymTrack com persistência SQLite e regras de negócio para treinos e recordes pessoais.",
    lifespan=lifespan
)

# Habilitar CORS para o frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
