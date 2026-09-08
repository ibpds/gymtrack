# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import func
from backend import models, schemas

# ====================
# USUÁRIOS
# ====================

def criar_usuario(db: Session, usuario: schemas.UsuarioCreate):
    db_usuario = models.Usuario(nome=usuario.nome, email=usuario.email, senha=usuario.senha)
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def get_usuarios(db: Session):
    return db.query(models.Usuario).all()

def get_usuario(db: Session, usuario_id: int):
    return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

# ====================
# EXERCÍCIOS
# ====================

def criar_exercicio(db: Session, exercicio: schemas.ExercicioCreate):
    db_exercicio = models.Exercicio(nome=exercicio.nome, grupo_muscular=exercicio.grupo_muscular)
    db.add(db_exercicio)
    db.commit()
    db.refresh(db_exercicio)
    return db_exercicio

def get_exercicios(db: Session):
    return db.query(models.Exercicio).all()

def get_exercicio(db: Session, exercicio_id: int):
    return db.query(models.Exercicio).filter(models.Exercicio.id == exercicio_id).first()

# ====================
# TREINOS
# ====================

def criar_treino(db: Session, treino: schemas.TreinoCreate):
    db_treino = models.Treino(nome=treino.nome, usuario_id=treino.usuario_id)
    db.add(db_treino)
    db.commit()
    db.refresh(db_treino)
    return db_treino

def get_treinos(db: Session, usuario_id: int):
    if usuario_id:
        return db.query(models.Treino).filter(models.Treino.usuario_id == usuario_id).all()
    return db.query(models.Treino).all()

def get_treino(db: Session, treino_id: int):
    return db.query(models.Treino).filter(models.Treino.id == treino_id).first()

def add_exercicio_treino(db: Session, treino_id: int, exercicio: schemas.TreinoExercicioCreate):
    db_treino_exercicio = models.TreinoExercicio(
        treino_id=treino_id,
        exercicio_id=exercicio.exercicio_id,
        series_planejadas=exercicio.series_planejadas,
        repeticoes_planejadas=exercicio.repeticoes_planejadas,
        carga_planejada=exercicio.carga_planejada
    )
    db.add(db_treino_exercicio)
    db.commit()
    db.refresh(db_treino_exercicio)
    return db_treino_exercicio

# ====================
# EXECUÇÕES
# ====================

def registrar_execucao(db: Session, execucao: schemas.ExecucaoTreinoCreate):
    db_execucao = models.ExecucaoTreino(
        treino_id=execucao.treino_id,
        usuario_id=execucao.usuario_id,
        data_execucao=execucao.data_execucao
    )
    db.add(db_execucao)
    db.flush() # Para pegar o ID da execucao antes de commitar

    for ex in execucao.exercicios:
        # Lógica de Recorde Pessoal (PR)
        maior_carga_anterior = db.query(func.max(models.ExecucaoExercicio.carga_realizada))\
            .join(models.ExecucaoTreino)\
            .filter(models.ExecucaoTreino.usuario_id == execucao.usuario_id)\
            .filter(models.ExecucaoExercicio.exercicio_id == ex.exercicio_id)\
            .scalar()
        
        is_pr = 1 if maior_carga_anterior is None or ex.carga_realizada > maior_carga_anterior else 0

        db_execucao_exercicio = models.ExecucaoExercicio(
            execucao_treino_id=db_execucao.id,
            exercicio_id=ex.exercicio_id,
            series_realizadas=ex.series_realizadas,
            repeticoes_realizadas=ex.repeticoes_realizadas,
            carga_realizada=ex.carga_realizada,
            pr=is_pr
        )
        db.add(db_execucao_exercicio)
    
    db.commit()
    db.refresh(db_execucao)
    return db_execucao

def get_execucoes(db: Session, usuario_id: int):
    return db.query(models.ExecucaoTreino).filter(models.ExecucaoTreino.usuario_id == usuario_id).all()

# ====================
# DASHBOARD E PROGRESSO
# ====================

def get_progresso(db: Session, usuario_id: int, exercicio_id: int):
    # Retorna a data e a carga maxima para cada execucao daquele exercicio
    resultados = db.query(models.ExecucaoTreino.data_execucao, func.max(models.ExecucaoExercicio.carga_realizada).label('carga_maxima'))\
        .join(models.ExecucaoExercicio)\
        .filter(models.ExecucaoTreino.usuario_id == usuario_id)\
        .filter(models.ExecucaoExercicio.exercicio_id == exercicio_id)\
        .group_by(models.ExecucaoTreino.data_execucao)\
        .order_by(models.ExecucaoTreino.data_execucao)\
        .all()
    
    progresso = [{"data": str(r[0]), "carga_maxima": r[1]} for r in resultados]
    return progresso

def get_dashboard(db: Session, usuario_id: int):
    total_treinos = db.query(models.ExecucaoTreino).filter(models.ExecucaoTreino.usuario_id == usuario_id).count()
    total_prs = db.query(models.ExecucaoExercicio)\
        .join(models.ExecucaoTreino)\
        .filter(models.ExecucaoTreino.usuario_id == usuario_id)\
        .filter(models.ExecucaoExercicio.pr == 1).count()
    
    return {
        "total_treinos": total_treinos,
        "total_prs": total_prs
    }
