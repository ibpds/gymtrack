from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from typing import List, Optional
from backend import service, schemas
from backend.database import get_db

router = APIRouter()

# ====================
# USUÁRIOS & LOGIN
# ====================

@router.post("/usuarios", response_model=schemas.Usuario, tags=["Usuários"])
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = service.get_usuario_by_email(db, email=usuario.email)
    if db_usuario:
        raise HTTPException(status_code=400, detail="Email já registrado")
    return service.criar_usuario(db=db, usuario=usuario)

@router.get("/usuarios", response_model=List[schemas.Usuario], tags=["Usuários"])
def listar_usuarios(db: Session = Depends(get_db)):
    return service.get_usuarios(db)

@router.post("/login", tags=["Login"])
def login(login_data: schemas.Login, db: Session = Depends(get_db)):
    usuario = service.get_usuario_by_email(db, login_data.email)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"mensagem": "Login bem-sucedido", "usuario_id": usuario.id, "nome": usuario.nome}

# ====================
# EXERCÍCIOS
# ====================

@router.get("/exercicios", response_model=List[schemas.Exercicio], tags=["Exercícios"])
def listar_exercicios(db: Session = Depends(get_db)):
    return service.get_exercicios(db)

@router.get("/exercicios/{id}", response_model=schemas.Exercicio, tags=["Exercícios"])
def buscar_exercicio(id: int, db: Session = Depends(get_db)):
    db_exercicio = service.get_exercicio(db, id)
    if db_exercicio is None:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")
    return db_exercicio

@router.post("/exercicios", response_model=schemas.Exercicio, tags=["Exercícios"])
def criar_exercicio(exercicio: schemas.ExercicioCreate, db: Session = Depends(get_db)):
    return service.criar_exercicio(db=db, exercicio=exercicio)

# ====================
# TREINOS
# ====================

@router.get("/treinos", response_model=List[schemas.Treino], tags=["Treinos"])
def listar_treinos(usuario_id: Optional[int] = None, db: Session = Depends(get_db)):
    return service.get_treinos(db, usuario_id=usuario_id)

@router.get("/treinos/{id}", response_model=schemas.Treino, tags=["Treinos"])
def buscar_treino(id: int, db: Session = Depends(get_db)):
    db_treino = service.get_treino(db, id)
    if db_treino is None:
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    return db_treino

@router.post("/treinos", response_model=schemas.Treino, tags=["Treinos"])
def criar_treino(treino: schemas.TreinoCreate, db: Session = Depends(get_db)):
    return service.criar_treino(db=db, treino=treino)

@router.post("/treinos/{id}/exercicios", response_model=schemas.TreinoExercicio, tags=["Treinos"])
def associar_exercicio_treino(id: int, exercicio: schemas.TreinoExercicioCreate, db: Session = Depends(get_db)):
    db_treino = service.get_treino(db, id)
    if db_treino is None:
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    return service.add_exercicio_treino(db=db, treino_id=id, exercicio=exercicio)

# ====================
# EXECUÇÕES
# ====================

@router.post("/execucoes", response_model=schemas.ExecucaoTreino, tags=["Execuções"])
def registrar_execucao(execucao: schemas.ExecucaoTreinoCreate, db: Session = Depends(get_db)):
    return service.registrar_execucao(db=db, execucao=execucao)

@router.get("/execucoes", response_model=List[schemas.ExecucaoTreino], tags=["Execuções"])
def listar_execucoes(usuario_id: int, db: Session = Depends(get_db)):
    return service.get_execucoes(db, usuario_id)

# ====================
# PROGRESSO & DASHBOARD
# ====================

@router.get("/progresso/{exercicio_id}", tags=["Evolução"])
def ver_progresso(exercicio_id: int, usuario_id: int, db: Session = Depends(get_db)):
    return service.get_progresso(db, usuario_id, exercicio_id)

@router.get("/dashboard/{usuario_id}", tags=["Evolução"])
def dashboard(usuario_id: int, db: Session = Depends(get_db)):
    return service.get_dashboard(db, usuario_id)
