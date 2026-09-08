from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# Usuario
class UsuarioBase(BaseModel):
    nome: str
    email: str

class UsuarioCreate(UsuarioBase):
    senha: Optional[str] = None

class Usuario(UsuarioBase):
    id: int
    class Config:
        orm_mode = True

class Login(BaseModel):
    email: str

# Exercicio
class ExercicioBase(BaseModel):
    nome: str
    grupo_muscular: Optional[str] = None

class ExercicioCreate(ExercicioBase):
    pass

class Exercicio(ExercicioBase):
    id: int
    class Config:
        orm_mode = True

# Treino Exercicio
class TreinoExercicioBase(BaseModel):
    exercicio_id: int
    series_planejadas: int
    repeticoes_planejadas: int
    carga_planejada: float

class TreinoExercicioCreate(TreinoExercicioBase):
    pass

class TreinoExercicio(TreinoExercicioBase):
    id: int
    class Config:
        orm_mode = True

# Treino
class TreinoBase(BaseModel):
    nome: str
    usuario_id: int

class TreinoCreate(TreinoBase):
    pass

class Treino(TreinoBase):
    id: int
    exercicios: List[TreinoExercicio] = []
    class Config:
        orm_mode = True

# Execucao Exercicio
class ExecucaoExercicioBase(BaseModel):
    exercicio_id: int
    series_realizadas: int
    repeticoes_realizadas: int
    carga_realizada: float

class ExecucaoExercicioCreate(ExecucaoExercicioBase):
    pass

class ExecucaoExercicio(ExecucaoExercicioBase):
    id: int
    pr: int
    class Config:
        orm_mode = True

# Execucao Treino
class ExecucaoTreinoBase(BaseModel):
    treino_id: int
    usuario_id: int
    data_execucao: date

class ExecucaoTreinoCreate(ExecucaoTreinoBase):
    exercicios: List[ExecucaoExercicioCreate]

class ExecucaoTreino(ExecucaoTreinoBase):
    id: int
    exercicios_executados: List[ExecucaoExercicio] = []
    class Config:
        orm_mode = True
