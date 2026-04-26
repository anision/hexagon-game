import uuid
from datetime import datetime, timezone

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.config import Config

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

_config = Config(environ={
    "GOOGLE_CLIENT_ID": settings.GOOGLE_CLIENT_ID,
    "GOOGLE_CLIENT_SECRET": settings.GOOGLE_CLIENT_SECRET,
})

oauth = OAuth(_config)
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/google")
async def login_google(request: Request):
    redirect_uri = str(request.url_for("auth_callback"))
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/callback", name="auth_callback")
async def auth_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception:
        return RedirectResponse(url=f"{settings.ALLOWED_ORIGIN}/?error=login_cancelled")

    user_info = token.get("userinfo") or await oauth.google.userinfo(token=token)

    async for db in get_db():
        result = await db.execute(
            select(User).where(User.google_id == user_info["sub"])
        )
        user = result.scalar_one_or_none()

        if user is None:
            user = User(
                id=str(uuid.uuid4()),
                google_id=user_info["sub"],
                name=user_info.get("name", ""),
                email=user_info.get("email", ""),
                avatar_url=user_info.get("picture"),
                created_at=datetime.now(timezone.utc),
            )
            db.add(user)
            await db.commit()

    jwt_token = create_access_token({"sub": user_info["sub"]})
    return RedirectResponse(url=f"{settings.ALLOWED_ORIGIN}/?token={jwt_token}")
