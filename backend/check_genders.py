from sqlalchemy import func
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db import SessionLocal
from models import FamilyMember

db = SessionLocal()
try:
    gender_counts = db.query(FamilyMember.gender, func.count(FamilyMember.id)).group_by(FamilyMember.gender).all()
    print("Gender counts in database:")
    for gender, count in gender_counts:
        print(f" - {gender}: {count}")
    
    total = db.query(func.count(FamilyMember.id)).scalar()
    print(f"Total members: {total}")
finally:
    db.close()
