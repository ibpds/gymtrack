# pyrefly: ignore [missing-import]
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date

# ====================
# USUÁRIO
# ====================

class UsuarioBase(BaseModel):
    nome: str
    email: str
    objetivo: Optional[str] = None
    nivel: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    senha: Optional[str] = None

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    senha: Optional[str] = None
    objetivo: Optional[str] = None
    nivel: Optional[str] = None

class Usuario(UsuarioBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class Login(BaseModel):
    email: str
    senha: Optional[str] = None

# ====================
# EXERCÍCIO
# ====================

class ExercicioBase(BaseModel):
    nome: str
    grupo_muscular: Optional[str] = None

class ExercicioCreate(ExercicioBase):
    pass

class ExercicioUpdate(BaseModel):
    nome: Optional[str] = None
    grupo_muscular: Optional[str] = None

class Exercicio(ExercicioBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ====================
# TREINO EXERCÍCIO (PLANEJADO)
# ====================

class TreinoExercicioBase(BaseModel):
    exercicio_id: Optional[int] = None
    exercicio_nome: Optional[str] = None
    series_planejadas: int = 4
    repeticoes_planejadas: int = 10
    carga_planejada: float = 0.0
    descanso: Optional[int] = 60
    observacao: Optional[str] = ""

class TreinoExercicioCreate(TreinoExercicioBase):
    pass

class TreinoExercicio(TreinoExercicioBase):
    id: int
    exercicio: Optional[Exercicio] = None
    model_config = ConfigDict(from_attributes=True)

    @property
    def nome(self) -> str:
        if self.exercicio and self.exercicio.nome:
            return self.exercicio.nome
        return self.exercicio_nome or ""

# ====================
# TREINO
# ====================

class TreinoBase(BaseModel):
    nome: str
    descricao: Optional[str] = ""
    duracao_estimada: Optional[int] = 0
    usuario_id: int

class TreinoCreate(TreinoBase):
    exercicios: Optional[List[TreinoExercicioCreate]] = []

class TreinoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    duracao_estimada: Optional[int] = None
    exercicios: Optional[List[TreinoExercicioCreate]] = None

class Treino(TreinoBase):
    id: int
    exercicios: List[TreinoExercicio] = []
    model_config = ConfigDict(from_attributes=True)

# ====================
# EXECUÇÃO DE EXERCÍCIO
# ====================

class ExecucaoExercicioBase(BaseModel):
    exercicio_id: Optional[int] = None
    exercicio_nome: Optional[str] = None
    series_realizadas: int = 0
    repeticoes_realizadas: int = 0
    carga_realizada: float = 0.0

class ExecucaoExercicioCreate(ExecucaoExercicioBase):
    pass

class ExecucaoExercicio(ExecucaoExercicioBase):
    id: int
    pr: int = 0
    exercicio: Optional[Exercicio] = None
    model_config = ConfigDict(from_attributes=True)

    @property
    def nome(self) -> str:
        if self.exercicio and self.exercicio.nome:
            return self.exercicio.nome
        return self.exercicio_nome or ""

# ====================
# EXECUÇÃO DE TREINO
# ====================

class ExecucaoTreinoBase(BaseModel):
    treino_id: Optional[int] = None
    treino_nome: Optional[str] = None
    usuario_id: int
    data_execucao: date
    duracao_segundos: Optional[int] = 0

class ExecucaoTreinoCreate(ExecucaoTreinoBase):
    exercicios: List[ExecucaoExercicioCreate]

class ExecucaoTreino(ExecucaoTreinoBase):
    id: int
    treino: Optional[Treino] = None
    exercicios_executados: List[ExecucaoExercicio] = []
    model_config = ConfigDict(from_attributes=True)
