import logging
from sqlalchemy import text
from db import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def upgrade():
    db = SessionLocal()
    try:
        logger.info("Adding 'marital_status' column to family_members table...")
        # Check if column exists first (PostgreSQL)
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='family_members' AND column_name='marital_status';
        """)
        result = db.execute(check_query).fetchone()
        
        if not result:
            db.execute(text("ALTER TABLE family_members ADD COLUMN marital_status VARCHAR(50);"))
            db.commit()
            logger.info("✅ Column 'marital_status' added successfully.")
        else:
            logger.info("ℹ️ Column 'marital_status' already exists.")
            
    except Exception as e:
        logger.error(f"❌ Error during upgrade: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    upgrade()
