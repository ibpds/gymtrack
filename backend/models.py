# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from backend.database import Base
import datetime

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha = Column(String, nullable=True) # Adicionado senha provisória caso precise no futuro

    treinos = relationship("Treino", back_populates="usuario")
    execucoes = relationship("ExecucaoTreino", back_populates="usuario")


class Exercicio(Base):
    __tablename__ = "exercicios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    grupo_muscular = Column(String, nullable=True)


class Treino(Base):
    __tablename__ = "treinos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))

    usuario = relationship("Usuario", back_populates="treinos")
    exercicios = relationship("TreinoExercicio", back_populates="treino", cascade="all, delete-orphan")


class TreinoExercicio(Base):
    __tablename__ = "treino_exercicio"

    id = Column(Integer, primary_key=True, index=True)
    treino_id = Column(Integer, ForeignKey("treinos.id"))
    exercicio_id = Column(Integer, ForeignKey("exercicios.id"))
    series_planejadas = Column(Integer)
    repeticoes_planejadas = Column(Integer)
    carga_planejada = Column(Float)

    treino = relationship("Treino", back_populates="exercicios")
    exercicio = relationship("Exercicio")


class ExecucaoTreino(Base):
    __tablename__ = "execucao_treino"

    id = Column(Integer, primary_key=True, index=True)
    treino_id = Column(Integer, ForeignKey("treinos.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    data_execucao = Column(Date, default=datetime.date.today)

    usuario = relationship("Usuario", back_populates="execucoes")
    treino = relationship("Treino")
    exercicios_executados = relationship("ExecucaoExercicio", back_populates="execucao_treino", cascade="all, delete-orphan")


class ExecucaoExercicio(Base):
    __tablename__ = "execucao_exercicio"

    id = Column(Integer, primary_key=True, index=True)
    execucao_treino_id = Column(Integer, ForeignKey("execucao_treino.id"))
    exercicio_id = Column(Integer, ForeignKey("exercicios.id"))
    series_realizadas = Column(Integer)
    repeticoes_realizadas = Column(Integer)
    carga_realizada = Column(Float)
    pr = Column(Integer, default=0) # 1 se for Recorde Pessoal (PR)

    execucao_treino = relationship("ExecucaoTreino", back_populates="exercicios_executados")
    exercicio = relationship("Exercicio")
