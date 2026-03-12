import sys
import os
from pathlib import Path

# Add the current directory to sys.path so we can import local modules
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

try:
    from db import engine, Base
    import models  # Must import models to register them with Base
    
    print("--- Starting Database Inspection & Repair ---")
    print(f"Targeting Database at: {engine.url}")
    
    # Create all missing tables
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created or verified successfully.")
    
    # Check if tables exist now
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Current tables in DB: {tables}")
    
    if "competitions" in tables:
        print("🚀 'competitions' table is READY.")
    else:
        print("❌ 'competitions' table is still MISSING!")

except Exception as e:
    print(f"❌ Error during repair: {e}")
    import traceback
    traceback.print_exc()
