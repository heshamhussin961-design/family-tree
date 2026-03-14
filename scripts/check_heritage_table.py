import os
import sys
from sqlalchemy import inspect

# Add parent directory to path to import models and db
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.db import engine

def check_tables():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Existing tables: {tables}")
    if "heritage" in tables:
        print("Table 'heritage' exists.")
    else:
        print("Table 'heritage' does NOT exist.")

if __name__ == "__main__":
    check_tables()
