from db import SessionLocal
from models import FamilyMember
import logging

logging.basicConfig(level=logging.INFO)

def fix_data():
    db = SessionLocal()
    try:
        # Mark everyone as approved and public so they show up in the tree and search
        updated_count = db.query(FamilyMember).update({
            FamilyMember.is_approved: True,
            FamilyMember.is_public: True
        })
        db.commit()
        logging.info(f"✅ Successfully activated {updated_count} family members!")
    except Exception as e:
        db.rollback()
        logging.error(f"❌ Error activating members: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_data()
