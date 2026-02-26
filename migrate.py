"""
One-time migration: adds the is_alive column to existing family_members table.
Run this ONCE if you get 'no such column: family_members.is_alive'.
"""
import sqlite3
from pathlib import Path

DB = Path(r"c:\Users\hussi\OneDrive\Desktop\family-tree\backend\family_tree.db")

conn = sqlite3.connect(str(DB))
cur  = conn.cursor()

# Check if column exists
cur.execute("PRAGMA table_info(family_members)")
cols = [row[1] for row in cur.fetchall()]
print(f"Existing columns: {cols}")

if "is_alive" not in cols:
    cur.execute("ALTER TABLE family_members ADD COLUMN is_alive INTEGER NOT NULL DEFAULT 1")
    conn.commit()
    print("✅ Column 'is_alive' added successfully!")
else:
    print("✅ Column 'is_alive' already exists — nothing to do.")

conn.close()
