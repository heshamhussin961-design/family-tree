import os
import sys

# Add the 'backend' directory to sys.path so 'import db' and 'import models' work
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

import db
import models

def create_tables():
    print("Connecting to:", db.DATABASE_URL)
    print("Creating tables...")
    db.Base.metadata.create_all(bind=db.engine)
    print("Tables created.")

if __name__ == "__main__":
    create_tables()
