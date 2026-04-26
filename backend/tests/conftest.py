"""
Shared fixtures for all backend tests.
Uses an in-memory SQLite database (aiosqlite) to avoid needing PostgreSQL.
"""
import uuid
from datetime import datetime, timezone

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.user import User  # noqa: F401 — ensures table is registered
from app.models.game import Game  # noqa: F401


DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    async with SessionLocal() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession):
    user = User(
        id=str(uuid.uuid4()),
        google_id="test-google-id",
        name="Test Player",
        email="test@example.com",
        avatar_url=None,
        created_at=datetime.now(timezone.utc),
    )
    db_session.add(user)
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def auth_token(test_user: User):
    return create_access_token({"sub": test_user.google_id})


@pytest_asyncio.fixture
async def client(db_session: AsyncSession, test_user: User, auth_token: str):
    """HTTP test client with the DB session injected and the test user pre-authenticated."""
    from app.main import app

    async def override_get_db():
        yield db_session

    from app.core import deps

    async def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[deps.get_current_user] = override_get_current_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
