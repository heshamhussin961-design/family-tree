from db import SessionLocal
from models import FamilyMember
import logging

logging.basicConfig(level=logging.INFO)

def fix_alive_status():
    db = SessionLocal()
    try:
        # If someone has a death year, they shouldn't be marked as alive
        updated_count = db.query(FamilyMember).filter(FamilyMember.death_year != None).update({
            FamilyMember.is_alive: False
        })
        db.commit()
        logging.info(f"✅ Successfully updated {updated_count} members to 'deceased' based on death year.")
    except Exception as e:
        db.rollback()
        logging.error(f"❌ Error fixing alive status: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_alive_status()
