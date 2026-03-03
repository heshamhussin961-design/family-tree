"""
One-time migration helper for the local SQLite DB.

- Adds the `is_alive` column if it does not exist.
- Adds the `blood_type` and `health_notes` columns if they do not exist.

Run this script from Python once whenever you pull new changes and need the
extra columns in an existing `family_tree.db` file.
"""
import sqlite3
from pathlib import Path

DB = Path(r"c:\Users\hussi\OneDrive\Desktop\family-tree\backend\family_tree.db")

conn = sqlite3.connect(str(DB))
cur = conn.cursor()

# Check existing columns
cur.execute("PRAGMA table_info(family_members)")
cols = [row[1] for row in cur.fetchall()]
print(f"Existing columns: {cols}")

changed = False

if "is_alive" not in cols:
    cur.execute("ALTER TABLE family_members ADD COLUMN is_alive INTEGER NOT NULL DEFAULT 1")
    changed = True
    print("Column 'is_alive' added successfully.")
else:
    print("Column 'is_alive' already exists — nothing to do.")

if "blood_type" not in cols:
    cur.execute("ALTER TABLE family_members ADD COLUMN blood_type TEXT NULL")
    changed = True
    print("Column 'blood_type' added successfully.")
else:
    print("Column 'blood_type' already exists — nothing to do.")

if "health_notes" not in cols:
    cur.execute("ALTER TABLE family_members ADD COLUMN health_notes TEXT NULL")
    changed = True
    print("Column 'health_notes' added successfully.")
else:
    print("Column 'health_notes' already exists — nothing to do.")

if changed:
    conn.commit()

conn.close()
