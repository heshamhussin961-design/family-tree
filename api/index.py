"""
Vercel Serverless Entry Point for Family Tree FastAPI Backend
"""
import sys
import os

# Add backend directory to Python path
# On Vercel: __file__ = /vercel/path0/api/index.py
# backend dir = /vercel/path0/backend/
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
sys.path.insert(0, os.path.abspath(backend_dir))

# Also set working directory so SQLite path resolves correctly
os.chdir(os.path.abspath(backend_dir))

# Now import the FastAPI app
from main import app  # noqa: F401
