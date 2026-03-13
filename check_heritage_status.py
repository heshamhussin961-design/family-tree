import os
import sys

# Add backend to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

try:
    import db
    import models
    print("Imports successful")
    
    session = db.SessionLocal()
    count = session.query(models.Heritage).count()
    print(f"Total sections in database: {count}")
    
    visible_count = session.query(models.Heritage).filter(models.Heritage.is_visible == True).count()
    print(f"Visible sections: {visible_count}")
    
    sections = session.query(models.Heritage).all()
    for s in sections:
        print(f" - [{s.id}] {s.section_key}: {s.title} (Visible: {s.is_visible})")
    
    session.close()
except Exception as e:
    print(f"Error: {e}")
