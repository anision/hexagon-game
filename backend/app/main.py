import sys
import logging

import fastapi
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Hexagon API",
    version="1.0.0",
    description="Backend for the Hexagon board game",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("Python version: %s", sys.version)
    logger.info("FastAPI version: %s", fastapi.__version__)
    logger.info("Hexagon API started")


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "service": "hexagon-api"}
