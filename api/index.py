"""
Vercel Serverless Entry Point — strips /api prefix before routing to FastAPI
"""
import sys
import os

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
sys.path.insert(0, os.path.abspath(backend_dir))

# Set working dir so SQLite resolves to backend/family_tree.db
os.chdir(os.path.abspath(backend_dir))

# Import the FastAPI app
from main import app as _fastapi_app  # noqa: E402


class StripApiPrefix:
    """
    ASGI middleware: strips /api prefix so FastAPI routes like /stats
    match requests arriving as /api/stats from Vercel.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            path = scope.get("path", "")
            if path.startswith("/api"):
                new_path = path[4:] or "/"
                scope = {**scope, "path": new_path, "raw_path": new_path.encode()}
        await self.app(scope, receive, send)


# Vercel looks for `app` — wrap FastAPI with the prefix stripper
app = StripApiPrefix(_fastapi_app)
