from db import SessionLocal
from models import FamilyMember
import logging

logging.basicConfig(level=logging.INFO)

def debug_info():
    db = SessionLocal()
    try:
        total = db.query(FamilyMember).count()
        approved = db.query(FamilyMember).filter(FamilyMember.is_approved == True).count()
        public = db.query(FamilyMember).filter(FamilyMember.is_public == True).count()
        roots = db.query(FamilyMember).filter(FamilyMember.parent_id == None).all()
        
        logging.info(f"Total Members: {total}")
        logging.info(f"Approved Members: {approved}")
        logging.info(f"Public Members: {public}")
        logging.info(f"Root Nodes Count: {len(roots)}")
        
        if roots:
            logging.info("--- Sample Roots ---")
            for r in roots[:5]:
                logging.info(f"ID: {r.id}, Name: {r.full_name}, Gender: {r.gender}, Approved: {r.is_approved}")
        else:
            logging.warning("⚠️ No roots found (parent_id is None). Checking if everyone has a parent...")
            has_parent = db.query(FamilyMember).filter(FamilyMember.parent_id != None).count()
            logging.info(f"Members with parents: {has_parent}")
            
            if total > 0:
                logging.info("--- Sample Members ---")
                for m in db.query(FamilyMember).limit(5).all():
                    logging.info(f"ID: {m.id}, Name: {m.full_name}, ParentID: {m.parent_id}")

    except Exception as e:
        logging.error(f"❌ Debug Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_info()
