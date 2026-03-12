import sys
from pathlib import Path
import re
from sqlalchemy.orm import Session
from db import SessionLocal, engine, Base
from models import FamilyMember

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def parse_gedcom(path: Path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Very simple GEDCOM parser for INDI records
    indis = re.split(r'\n0 @I', content)[1:]
    people = []
    
    for indi in indis:
        cid = re.search(r'^(\d+)@ INDI', indi)
        if not cid: continue
        ged_id = int(cid.group(1))
        
        name_match = re.search(r'\n1 NAME (.*)', indi)
        name = name_match.group(1).replace('/', '').strip() if name_match else "Unknown"
        
        gender_match = re.search(r'\n1 SEX (M|F)', indi)
        gender = "male" if gender_match and gender_match.group(1) == 'M' else "female"
        
        birth_match = re.search(r'\n1 BIRT\n2 DATE (\d{4})', indi)
        birth = int(birth_match.group(1)) if birth_match else None
        
        death_match = re.search(r'\n1 DEAT\n2 DATE (\d{4})', indi)
        death = int(death_match.group(1)) if death_match else None
        
        is_alive = False if "\n1 DEAT" in indi else True
        
        parent_match = re.search(r'\n1 FAMC @F(\d+)@', indi)
        parent_ged_id = int(parent_match.group(1)) if parent_match else None
        
        people.append({
            "ged_id": ged_id,
            "name": name,
            "gender": gender,
            "birth": birth,
            "death": death,
            "is_alive": is_alive,
            "parent_ged_id": parent_ged_id
        })
    return people

def import_data(ged_file: str):
    db = SessionLocal()
    try:
        people = parse_gedcom(Path(ged_file))
        print(f"Parsed {len(people)} people from GEDCOM.")
        
        # Clear existing (optional - risky)
        # db.query(FamilyMember).delete()
        
        # Map GED ID to DB ID
        ged_to_member = {}
        
        # First pass: create members
        for p in people:
            m = FamilyMember(
                full_name=p["name"],
                gender=p["gender"],
                birth_year=p["birth"],
                death_year=p["death"],
                is_alive=p["is_alive"],
                is_approved=True
            )
            db.add(m)
            db.flush() # Get ID
            ged_to_member[p["ged_id"]] = m
        
        # Second pass: link parents
        for p in people:
            if p["parent_ged_id"] and p["parent_ged_id"] in ged_to_member:
                child = ged_to_member[p["ged_id"]]
                parent = ged_to_member[p["parent_ged_id"]]
                child.parent_id = parent.id
        
        db.commit()
        print("✅ Import successful!")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 import_gedcom_v2.py <file.ged>")
    else:
        import_data(sys.argv[1])
