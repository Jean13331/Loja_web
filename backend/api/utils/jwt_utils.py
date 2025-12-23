import os
from datetime import datetime, timedelta, timezone

import jwt


JWT_SECRET = os.getenv("JWT_SECRET", "seu-secret-key-aqui-mude-em-producao")
JWT_EXPIRES_IN = os.getenv("JWT_EXPIRES_IN", "7d")


def _parse_expires(expires: str) -> timedelta:
    try:
        if expires.endswith("d"):
            return timedelta(days=int(expires[:-1]))
        if expires.endswith("h"):
            return timedelta(hours=int(expires[:-1]))
        if expires.endswith("m"):
            return timedelta(minutes=int(expires[:-1]))
    except Exception:
        pass
    return timedelta(days=7)


def generate_token(user_payload: dict) -> str:
    expires_delta = _parse_expires(JWT_EXPIRES_IN)
    payload = {
        **user_payload,
        "exp": datetime.now(timezone.utc) + expires_delta,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])


