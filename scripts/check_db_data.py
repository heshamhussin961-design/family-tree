from backend.db import SessionLocal
from backend.models import Heritage
import json

def check_data():
    db = SessionLocal()
    try:
        sections = db.query(Heritage).all()
        print(f"Total sections found: {len(sections)}")
        for s in sections:
            print(f"ID: {s.id}, Key: {s.section_key}, Title: {s.title}, Visible: {s.is_visible}, Order: {s.order}")
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
