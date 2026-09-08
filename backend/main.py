from fastapi import FastAPI
from backend.controller import router
from backend import models
from backend.database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GymTrack API",
    version="1.0.0"
)

app.include_router(router)
