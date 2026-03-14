import os
import sys

# Add backend to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

import db
import models

def merge_sections():
    session = db.SessionLocal()
    try:
        # 1. Find the two sections
        roots = session.query(models.Heritage).filter(models.Heritage.section_key == "roots").first()
        global_conn = session.query(models.Heritage).filter(models.Heritage.section_key == "global_connections").first()
        
        if not roots and not global_conn:
            print("Sections not found in DB. Might be already merged or named differently.")
            # Check if we should create it
            existing_merged = session.query(models.Heritage).filter(models.Heritage.section_key == "roots_history").first()
            if existing_merged:
                print("Merged section already exists.")
                return

        # 2. Extract content
        merged_paragraphs = []
        
        if roots:
            if "text" in roots.content: merged_paragraphs.append(roots.content["text"])
            if "extra" in roots.content: merged_paragraphs.append(roots.content["extra"])
            session.delete(roots)
            
        if global_conn:
            if "paragraphs" in global_conn.content:
                merged_paragraphs.extend(global_conn.content["paragraphs"])
            elif "text" in global_conn.content:
                merged_paragraphs.append(global_conn.content["text"])
            session.delete(global_conn)

        # 3. Create merged section
        new_section = models.Heritage(
            section_key="roots_history",
            type="text",
            title="تاريخنا وجذورنا حول العالم",
            subtitle="نعتز بجذورنا ونصل أرحامنا أينما كانوا",
            content={"paragraphs": merged_paragraphs},
            icon="Globe",
            order=2,
            is_visible=True
        )
        
        session.add(new_section)
        session.commit()
        print("Success: Sections merged into 'roots_history'")
        
    except Exception as e:
        session.rollback()
        print(f"Error merging sections: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    merge_sections()
