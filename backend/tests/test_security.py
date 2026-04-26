from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException
from jose import jwt

from app.core.security import create_access_token, decode_access_token, ALGORITHM
from app.core.config import settings


def test_create_and_decode_token():
    data = {"sub": "google-id-123"}
    token = create_access_token(data)
    payload = decode_access_token(token)
    assert payload["sub"] == "google-id-123"
    assert "exp" in payload


def test_expired_token_raises_401():
    payload = {
        "sub": "google-id-123",
        "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
    }
    expired_token = jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token(expired_token)
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Token expirado"


def test_invalid_token_raises_401():
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token("este.nao.e.um.token.valido")
    assert exc_info.value.status_code == 401
