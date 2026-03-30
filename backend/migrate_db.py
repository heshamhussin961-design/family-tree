import sys
import os
from pathlib import Path
from sqlalchemy import create_engine, text, inspect
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migration")

# Add the current directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

def migrate():
    try:
        from db import engine, Base
        import models
        
        logger.info(f"Connecting to database: {engine.url}")
        
        # 1. Create all missing tables
        Base.metadata.create_all(bind=engine)
        logger.info("✅ All tables created or verified.")
        
        # 2. Add missing columns to family_members
        inspector = inspect(engine)
        existing_columns = [c['name'] for c in inspector.get_columns('family_members')]
        
        # List of columns that might be missing (from models.py)
        columns_to_add = [
            ("blood_type", "TEXT"),
            ("profession", "TEXT"),
            ("university_degree", "TEXT"),
            ("job_title", "TEXT"),
            ("is_student", "BOOLEAN DEFAULT 0"),
            ("looking_for_job", "BOOLEAN DEFAULT 0"),
            ("is_approved", "BOOLEAN DEFAULT 1"),
            ("birth_place", "TEXT"),
            ("residence_place", "TEXT"),
            ("is_married", "BOOLEAN DEFAULT 0"),
            ("marital_status", "TEXT"),
            ("is_public", "BOOLEAN DEFAULT 1"),
            ("mother_name", "TEXT"),
            ("biography", "TEXT")
        ]
        
        with engine.connect() as conn:
            for col_name, col_type in columns_to_add:
                if col_name not in existing_columns:
                    logger.info(f"Adding column '{col_name}' to 'family_members'...")
                    try:
                        conn.execute(text(f"ALTER TABLE family_members ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        logger.info(f"✅ Column '{col_name}' added.")
                    except Exception as e:
                        logger.error(f"❌ Failed to add column '{col_name}': {e}")
                else:
                    logger.info(f"Column '{col_name}' already exists.")
            
        logger.info("🎉 Migration completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    migrate()
