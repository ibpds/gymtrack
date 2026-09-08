# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session, joinedload
# pyrefly: ignore [missing-import]
from sqlalchemy import func
from datetime import date, timedelta
from backend import models, schemas

# ====================
# USUÁRIOS
# ====================

def criar_usuario(db: Session, usuario: schemas.UsuarioCreate):
    db_usuario = models.Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha=usuario.senha,
        objetivo=usuario.objetivo or "Hipertrofia",
        nivel=usuario.nivel or "Intermediário"
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def get_usuarios(db: Session):
    return db.query(models.Usuario).all()

def get_usuario(db: Session, usuario_id: int):
    return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email.ilike(email.strip())).first()

def update_usuario(db: Session, usuario_id: int, dados: schemas.UsuarioUpdate):
    usuario = get_usuario(db, usuario_id)
    if not usuario:
        return None
    if dados.nome is not None:
        usuario.nome = dados.nome
    if dados.email is not None:
        usuario.email = dados.email
    if dados.senha is not None and dados.senha.strip():
        usuario.senha = dados.senha
    if dados.objetivo is not None:
        usuario.objetivo = dados.objetivo
    if dados.nivel is not None:
        usuario.nivel = dados.nivel
    db.commit()
    db.refresh(usuario)
    return usuario

# ====================
# EXERCÍCIOS
# ====================

def criar_exercicio(db: Session, exercicio: schemas.ExercicioCreate):
    db_exercicio = models.Exercicio(nome=exercicio.nome.strip(), grupo_muscular=exercicio.grupo_muscular)
    db.add(db_exercicio)
    db.commit()
    db.refresh(db_exercicio)
    return db_exercicio

def get_exercicios(db: Session):
    return db.query(models.Exercicio).order_by(models.Exercicio.nome).all()

def get_exercicio(db: Session, exercicio_id: int):
    return db.query(models.Exercicio).filter(models.Exercicio.id == exercicio_id).first()

def get_exercicio_by_nome(db: Session, nome: str):
    return db.query(models.Exercicio).filter(models.Exercicio.nome.ilike(nome.strip())).first()

def update_exercicio(db: Session, exercicio_id: int, dados: schemas.ExercicioUpdate):
    ex = get_exercicio(db, exercicio_id)
    if not ex:
        return None
    if dados.nome is not None:
        ex.nome = dados.nome.strip()
    if dados.grupo_muscular is not None:
        ex.grupo_muscular = dados.grupo_muscular
    db.commit()
    db.refresh(ex)
    return ex

def delete_exercicio(db: Session, exercicio_id: int):
    ex = get_exercicio(db, exercicio_id)
    if not ex:
        return False
    db.delete(ex)
    db.commit()
    return True

def obter_ou_criar_exercicio(db: Session, exercicio_id: int = None, nome: str = None):
    if exercicio_id:
        ex = get_exercicio(db, exercicio_id)
        if ex:
            return ex
    if nome and nome.strip():
        ex = get_exercicio_by_nome(db, nome.strip())
        if ex:
            return ex
        # Cria novo exercício se não existir
        return criar_exercicio(db, schemas.ExercicioCreate(nome=nome.strip()))
    return None

# ====================
# TREINOS
# ====================

def criar_treino(db: Session, treino: schemas.TreinoCreate):
    db_treino = models.Treino(
        nome=treino.nome,
        descricao=treino.descricao or "",
        duracao_estimada=treino.duracao_estimada or 0,
        usuario_id=treino.usuario_id
    )
    db.add(db_treino)
    db.commit()
    db.refresh(db_treino)

    if treino.exercicios:
        for ex in treino.exercicios:
            exercicio_obj = obter_ou_criar_exercicio(db, ex.exercicio_id, ex.exercicio_nome)
            if exercicio_obj:
                db_item = models.TreinoExercicio(
                    treino_id=db_treino.id,
                    exercicio_id=exercicio_obj.id,
                    series_planejadas=ex.series_planejadas,
                    repeticoes_planejadas=ex.repeticoes_planejadas,
                    carga_planejada=ex.carga_planejada,
                    descanso=ex.descanso or 60,
                    observacao=ex.observacao or ""
                )
                db.add(db_item)
        db.commit()
        db.refresh(db_treino)

    return db_treino

def get_treinos(db: Session, usuario_id: int = None):
    query = db.query(models.Treino).options(
        joinedload(models.Treino.exercicios).joinedload(models.TreinoExercicio.exercicio)
    )
    if usuario_id:
        query = query.filter(models.Treino.usuario_id == usuario_id)
    return query.all()

def get_treino(db: Session, treino_id: int):
    return db.query(models.Treino).options(
        joinedload(models.Treino.exercicios).joinedload(models.TreinoExercicio.exercicio)
    ).filter(models.Treino.id == treino_id).first()

def update_treino(db: Session, treino_id: int, dados: schemas.TreinoUpdate):
    treino = get_treino(db, treino_id)
    if not treino:
        return None

    if dados.nome is not None:
        treino.nome = dados.nome
    if dados.descricao is not None:
        treino.descricao = dados.descricao
    if dados.duracao_estimada is not None:
        treino.duracao_estimada = dados.duracao_estimada

    if dados.exercicios is not None:
        # Remove os exercícios atuais e substitui pelos novos
        db.query(models.TreinoExercicio).filter(models.TreinoExercicio.treino_id == treino_id).delete()
        for ex in dados.exercicios:
            exercicio_obj = obter_ou_criar_exercicio(db, ex.exercicio_id, ex.exercicio_nome)
            if exercicio_obj:
                db_item = models.TreinoExercicio(
                    treino_id=treino.id,
                    exercicio_id=exercicio_obj.id,
                    series_planejadas=ex.series_planejadas,
                    repeticoes_planejadas=ex.repeticoes_planejadas,
                    carga_planejada=ex.carga_planejada,
                    descanso=ex.descanso or 60,
                    observacao=ex.observacao or ""
                )
                db.add(db_item)

    db.commit()
    db.refresh(treino)
    return treino

def delete_treino(db: Session, treino_id: int):
    treino = get_treino(db, treino_id)
    if not treino:
        return False
    db.delete(treino)
    db.commit()
    return True

def add_exercicio_treino(db: Session, treino_id: int, exercicio: schemas.TreinoExercicioCreate):
    exercicio_obj = obter_ou_criar_exercicio(db, exercicio.exercicio_id, exercicio.exercicio_nome)
    if not exercicio_obj:
        raise ValueError("Exercício não encontrado ou inválido")

    db_treino_exercicio = models.TreinoExercicio(
        treino_id=treino_id,
        exercicio_id=exercicio_obj.id,
        series_planejadas=exercicio.series_planejadas,
        repeticoes_planejadas=exercicio.repeticoes_planejadas,
        carga_planejada=exercicio.carga_planejada,
        descanso=exercicio.descanso or 60,
        observacao=exercicio.observacao or ""
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
        data_execucao=execucao.data_execucao,
        duracao_segundos=execucao.duracao_segundos or 0
    )
    db.add(db_execucao)
    db.flush()

    for ex in execucao.exercicios:
        exercicio_obj = obter_ou_criar_exercicio(db, ex.exercicio_id, ex.exercicio_nome)
        if not exercicio_obj:
            continue

        # Lógica de Recorde Pessoal (PR)
        maior_carga_anterior = db.query(func.max(models.ExecucaoExercicio.carga_realizada))\
            .join(models.ExecucaoTreino)\
            .filter(models.ExecucaoTreino.usuario_id == execucao.usuario_id)\
            .filter(models.ExecucaoExercicio.exercicio_id == exercicio_obj.id)\
            .scalar()

        is_pr = 1 if maior_carga_anterior is None or ex.carga_realizada > maior_carga_anterior else 0

        db_execucao_exercicio = models.ExecucaoExercicio(
            execucao_treino_id=db_execucao.id,
            exercicio_id=exercicio_obj.id,
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
    return db.query(models.ExecucaoTreino).options(
        joinedload(models.ExecucaoTreino.treino),
        joinedload(models.ExecucaoTreino.exercicios_executados).joinedload(models.ExecucaoExercicio.exercicio)
    ).filter(models.ExecucaoTreino.usuario_id == usuario_id).order_by(models.ExecucaoTreino.data_execucao.desc(), models.ExecucaoTreino.id.desc()).all()

# ====================
# DASHBOARD E PROGRESSO
# ====================

def get_progresso(db: Session, usuario_id: int, exercicio_id: int):
    resultados = db.query(
        models.ExecucaoTreino.data_execucao,
        func.max(models.ExecucaoExercicio.carga_realizada).label('carga_maxima')
    )\
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

    total_volume = db.query(func.sum(models.ExecucaoExercicio.carga_realizada * models.ExecucaoExercicio.repeticoes_realizadas))\
        .join(models.ExecucaoTreino)\
        .filter(models.ExecucaoTreino.usuario_id == usuario_id).scalar() or 0.0

    return {
        "total_treinos": total_treinos,
        "total_prs": total_prs,
        "total_volume": float(total_volume)
    }

# ====================
# SEED INICIAL (SQLite)
# ====================

def seed_db(db: Session):
    # Verifica se já há usuários
    if db.query(models.Usuario).first() is not None:
        return

    # 1. Usuário padrão
    usuario = models.Usuario(
        nome="João Silva",
        email="joao@email.com",
        senha="123",
        objetivo="Hipertrofia",
        nivel="Intermediário"
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    # 2. Exercícios padrão
    exercicios_iniciais = [
        ("Agachamento", "Pernas"),
        ("Leg press", "Pernas"),
        ("Cadeira extensora", "Pernas"),
        ("Elevação pélvica", "Glúteos"),
        ("Mesa flexora", "Posterior"),
        ("Panturrilha", "Pernas"),
        ("Supino reto", "Peito"),
        ("Supino inclinado", "Peito"),
        ("Crucifixo", "Peito"),
        ("Tríceps corda", "Tríceps"),
        ("Tríceps francês", "Tríceps"),
        ("Puxada frontal", "Costas"),
        ("Remada baixa", "Costas"),
        ("Remada unilateral", "Costas"),
        ("Rosca direta", "Bíceps"),
        ("Rosca martelo", "Bíceps"),
        ("Rosca concentrada", "Bíceps"),
    ]

    exercicios_map = {}
    for nome, grupo in exercicios_iniciais:
        ex = models.Exercicio(nome=nome, grupo_muscular=grupo)
        db.add(ex)
        db.flush()
        exercicios_map[nome] = ex

    db.commit()

    # 3. Treinos padrão (A, B, C)
    treinos_dados = [
        {
            "nome": "Treino A - Pernas & Glúteos",
            "descricao": "Foco em quadríceps, posterior e glúteos.",
            "duracao_estimada": 55,
            "itens": [
                ("Agachamento", 4, 10, 40.0, 60, "Controle a descida e mantenha a postura."),
                ("Leg press", 4, 12, 80.0, 60, "Mantenha os pés firmes na plataforma."),
                ("Cadeira extensora", 3, 12, 35.0, 45, "Evite movimentos muito rápidos."),
                ("Elevação pélvica", 4, 10, 50.0, 60, "Contraia os glúteos no topo."),
                ("Mesa flexora", 3, 12, 30.0, 45, ""),
                ("Panturrilha", 4, 15, 25.0, 45, "")
            ]
        },
        {
            "nome": "Treino B - Peito & Tríceps",
            "descricao": "Treino de empurrar com foco em força.",
            "duracao_estimada": 50,
            "itens": [
                ("Supino reto", 4, 10, 40.0, 60, ""),
                ("Supino inclinado", 3, 10, 30.0, 60, ""),
                ("Crucifixo", 3, 12, 12.0, 45, ""),
                ("Tríceps corda", 3, 12, 25.0, 45, ""),
                ("Tríceps francês", 3, 12, 12.0, 45, "")
            ]
        },
        {
            "nome": "Treino C - Costas & Bíceps",
            "descricao": "Foco em puxadas, remadas e bíceps.",
            "duracao_estimada": 60,
            "itens": [
                ("Puxada frontal", 4, 10, 45.0, 60, ""),
                ("Remada baixa", 4, 10, 40.0, 60, ""),
                ("Remada unilateral", 3, 12, 18.0, 45, ""),
                ("Rosca direta", 3, 12, 15.0, 45, ""),
                ("Rosca martelo", 3, 12, 10.0, 45, ""),
                ("Rosca concentrada", 3, 10, 8.0, 45, "")
            ]
        }
    ]

    treinos_criados = []
    for t in treinos_dados:
        db_t = models.Treino(
            nome=t["nome"],
            descricao=t["descricao"],
            duracao_estimada=t["duracao_estimada"],
            usuario_id=usuario.id
        )
        db.add(db_t)
        db.flush()
        for nome_ex, series, reps, carga, descanso, obs in t["itens"]:
            ex_obj = exercicios_map.get(nome_ex)
            if ex_obj:
                db_item = models.TreinoExercicio(
                    treino_id=db_t.id,
                    exercicio_id=ex_obj.id,
                    series_planejadas=series,
                    repeticoes_planejadas=reps,
                    carga_planejada=carga,
                    descanso=descanso,
                    observacao=obs
                )
                db.add(db_item)
        treinos_criados.append(db_t)

    db.commit()

    # 4. Histórico inicial de execuções para alimentar gráficos e dashboards
    hoje = date.today()
    execucoes_iniciais = [
        {
            "treino": treinos_criados[0],
            "data": hoje - timedelta(days=14),
            "duracao": 3300,
            "exercicios": [
                ("Agachamento", 4, 10, 35.0),
                ("Leg press", 4, 12, 70.0),
                ("Cadeira extensora", 3, 12, 30.0)
            ]
        },
        {
            "treino": treinos_criados[1],
            "data": hoje - timedelta(days=12),
            "duracao": 3000,
            "exercicios": [
                ("Supino reto", 4, 10, 35.0),
                ("Crucifixo", 3, 12, 10.0),
                ("Tríceps corda", 3, 12, 20.0)
            ]
        },
        {
            "treino": treinos_criados[2],
            "data": hoje - timedelta(days=9),
            "duracao": 3600,
            "exercicios": [
                ("Puxada frontal", 4, 10, 40.0),
                ("Remada baixa", 4, 10, 35.0),
                ("Rosca direta", 3, 12, 12.0)
            ]
        },
        {
            "treino": treinos_criados[0],
            "data": hoje - timedelta(days=7),
            "duracao": 3400,
            "exercicios": [
                ("Agachamento", 4, 10, 40.0), # PR
                ("Leg press", 4, 12, 80.0),   # PR
                ("Cadeira extensora", 3, 12, 35.0) # PR
            ]
        },
        {
            "treino": treinos_criados[1],
            "data": hoje - timedelta(days=4),
            "duracao": 3100,
            "exercicios": [
                ("Supino reto", 4, 10, 40.0), # PR
                ("Crucifixo", 3, 12, 12.0),   # PR
                ("Tríceps corda", 3, 12, 25.0) # PR
            ]
        },
        {
            "treino": treinos_criados[2],
            "data": hoje - timedelta(days=2),
            "duracao": 3600,
            "exercicios": [
                ("Puxada frontal", 4, 10, 45.0), # PR
                ("Remada baixa", 4, 10, 40.0),   # PR
                ("Rosca direta", 3, 12, 15.0)    # PR
            ]
        }
    ]

    for exec_data in execucoes_iniciais:
        exec_obj = models.ExecucaoTreino(
            treino_id=exec_data["treino"].id,
            usuario_id=usuario.id,
            data_execucao=exec_data["data"],
            duracao_segundos=exec_data["duracao"]
        )
        db.add(exec_obj)
        db.flush()

        for nome_ex, series, reps, carga in exec_data["exercicios"]:
            ex_obj = exercicios_map.get(nome_ex)
            if ex_obj:
                # checar PR
                maior_ant = db.query(func.max(models.ExecucaoExercicio.carga_realizada))\
                    .join(models.ExecucaoTreino)\
                    .filter(models.ExecucaoTreino.usuario_id == usuario.id)\
                    .filter(models.ExecucaoExercicio.exercicio_id == ex_obj.id)\
                    .scalar()

                is_pr = 1 if maior_ant is None or carga > maior_ant else 0

                item_exec = models.ExecucaoExercicio(
                    execucao_treino_id=exec_obj.id,
                    exercicio_id=ex_obj.id,
                    series_realizadas=series,
                    repeticoes_realizadas=reps,
                    carga_realizada=carga,
                    pr=is_pr
                )
                db.add(item_exec)

    db.commit()
