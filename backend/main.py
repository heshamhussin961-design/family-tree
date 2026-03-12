import os
import logging
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from fastapi.exceptions import RequestValidationError

# Load env early
load_dotenv()

from db import Base, engine
from routers import auth, members, admin, archive, ambassadors, competitions

# Initialize DB Tables 
# Note: In production, using Alembic is recommended over Base.metadata.create_all
Base.metadata.create_all(bind=engine)

# Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("family-tree")

app = FastAPI(
    title="Family Tree API",
    docs_url=None, 
    redoc_url=None, 
    openapi_url=None # Hardened: docs disabled by default
)

# CORS Configuration
CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
PROD_ORIGIN = os.getenv("CORS_ORIGIN")
if PROD_ORIGIN:
    CORS_ORIGINS.append(PROD_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads Directory Setup
UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

try:
    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
except Exception as e:
    logger.error(f"Failed to mount uploads: {e}")

# Arabic Validation Error Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = "خطأ في بعض البيانات المُدخلة"
    if len(errors) > 0:
        first_err = errors[0]
        field = first_err.get("loc", [""])[-1] if first_err.get("loc") else "حقل"
        msg = f"خطأ في {field}"
    return JSONResponse(status_code=422, content={"detail": msg})

# Register Routers
app.include_router(auth.router)
app.include_router(members.router)
app.include_router(admin.router)
app.include_router(archive.router)
app.include_router(ambassadors.router)
app.include_router(competitions.router)

# ── Serve Frontend (Production Mode) ──────────────────────────────────────────
# This allows the FastAPI server to serve the React built files directly.
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(frontend_path):
    # Mount assets folder for static files
    assets_path = os.path.join(frontend_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve as regular file if it exists
        target_file = os.path.join(frontend_path, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        # Otherwise serve index.html for SPA routing
        return FileResponse(os.path.join(frontend_path, "index.html"))
