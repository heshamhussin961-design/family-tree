"""
Vercel serverless entry point — delegates to the existing FastAPI app.
The working directory on Vercel is the repo root, so we reference the
backend package via sys.path manipulation.
"""
import sys
import os

# Make the backend folder importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# Import the FastAPI app from backend/main.py
from main import app  # noqa: F401  (Vercel looks for `app`)
