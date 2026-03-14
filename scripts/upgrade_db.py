import logging
from sqlalchemy import text
from db import engine, Base
import models # Ensure models are loaded

logging.basicConfig(level=logging.INFO)

def upgrade_schema():
    with engine.begin() as conn:
        try:
            # Since the table is fully empty and we are doing a fresh import, 
            # the safest way to ensure SQLAlchemy sees all new columns without caching 
            # is to drop the empty table and recreate it from the models definition.
            conn.execute(text("DROP TABLE IF EXISTS spouses CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS family_members CASCADE;"))
            logging.info("🧹 Cleared old empty tables.")
        except Exception as e:
            logging.error(f"Error dropping tables: {e}")

    # Recreate tables with all new columns from models.py
    Base.metadata.create_all(bind=engine)
    logging.info("✅ Schema recreated successfully with all new columns!")

if __name__ == "__main__":
    upgrade_schema()
