import sys
import os
import re
from pathlib import Path
from sqlalchemy import text
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db import SessionLocal, engine, Base
from models import FamilyMember, Spouse

# Ensure tables exist and columns are updated
Base.metadata.create_all(bind=engine)

MONTH_MAP = {
    'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
    'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
}

def parse_gedcom_date(date_str):
    if not date_str:
        return None, None, None
    parts = date_str.strip().split()
    day, month, year = None, None, None
    
    if len(parts) == 3:
        try:
            day = int(parts[0])
            month = MONTH_MAP.get(parts[1].upper())
            year = int(parts[2])
        except: pass
    elif len(parts) == 2:
        month = MONTH_MAP.get(parts[0].upper())
        try: year = int(parts[1])
        except: pass
    elif len(parts) == 1:
        try: year = int(parts[0])
        except: pass
    return day, month, year

def parse_gedcom(path: Path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    indis = re.split(r'\n0 @I', content)[1:]
    people = []
    
    for indi in indis:
        cid = re.search(r'^(\d+)@ INDI', indi)
        if not cid: continue
        ged_id = int(cid.group(1))
        
        name_match = re.search(r'\n1 NAME (.*)', indi)
        name = name_match.group(1).replace('/', '').strip() if name_match else "Unknown"
        
        gender_match = re.search(r'\n1 SEX (M|F|Male|Female)', indi, re.I)
        gender = "male"
        if gender_match:
            g = gender_match.group(1).upper()
            if g.startswith('F'):
                gender = "female"
        
        birth_match = re.search(r'\n1 BIRT\n2 DATE (.*)', indi)
        b_day, b_month, b_year = parse_gedcom_date(birth_match.group(1) if birth_match else None)
        
        death_match = re.search(r'\n1 DEAT\n2 DATE (.*)', indi)
        d_day, d_month, d_year = parse_gedcom_date(death_match.group(1) if death_match else None)
        
        is_alive = False if "\n1 DEAT" in indi else True
        
        parent_match = re.search(r'\n1 FAMC @F(\d+)@', indi)
        parent_ged_id = int(parent_match.group(1)) if parent_match else None
        
        people.append({
            "ged_id": ged_id,
            "name": name,
            "gender": gender,
            "birth_year": b_year,
            "birth_month": b_month,
            "birth_day": b_day,
            "death_year": d_year,
            "death_month": d_month,
            "death_day": d_day,
            "is_alive": is_alive,
            "parent_ged_id": parent_ged_id
        })
    return people

def reset_and_import(ged_file: str):
    db = SessionLocal()
    try:
        people = parse_gedcom(Path(ged_file))
        print(f"Parsed {len(people)} unique people from GEDCOM.")
        
        # 🚨 DANGER: Clearing existing data to fix duplication
        print("Cleaning existing members and spouses...")
        db.query(Spouse).delete()
        db.query(FamilyMember).delete()
        db.commit() # Commit deletion first
        
        # Reset IDs (Postgres specific)
        try:
            db.execute(text("ALTER SEQUENCE family_members_id_seq RESTART WITH 1;"))
            db.execute(text("ALTER SEQUENCE spouses_id_seq RESTART WITH 1;"))
            db.commit()
        except:
            db.rollback() # Skip if not Postgres or sequence doesn't exist
        
        # Map GED ID to DB ID
        ged_to_member = {}
        
        # First pass: create members
        for p in people:
            m = FamilyMember(
                full_name=p["name"],
                gender=p["gender"],
                birth_year=p["birth_year"],
                birth_month=p["birth_month"],
                birth_day=p["birth_day"],
                death_year=p["death_year"],
                death_month=p["death_month"],
                death_day=p["death_day"],
                is_alive=p["is_alive"],
                is_approved=True,
                is_public=True
            )
            db.add(m)
            db.flush() # Get ID
            ged_to_member[p["ged_id"]] = m
        
        # Second pass: link parents
        links = 0
        for p in people:
            if p["parent_ged_id"] and p["parent_ged_id"] in ged_to_member:
                child = ged_to_member[p["ged_id"]]
                parent = ged_to_member[p["parent_ged_id"]]
                if child.id != parent.id:
                    child.parent_id = parent.id
                    links += 1
        
        db.commit()
        print(f"✅ CLEAN IMPORT SUCCESSFUL!")
        print(f"Total Imported: {len(people)}")
        print(f"Total Relationships Linked: {links}")
        
    except Exception as e:
        print(f"❌ Error during import: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 clean_import.py <file.ged>")
    else:
        # Ask for confirmation if running interactively or just warn
        print("WARNING: This will DELETE all existing family members and spouses before importing.")
        reset_and_import(sys.argv[1])
