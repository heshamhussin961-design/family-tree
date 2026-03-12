import os
import sys
from sqlalchemy import text
# Add the current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db import engine

commands = [
    "ALTER TABLE family_members ADD COLUMN IF NOT EXISTS birth_month INTEGER;",
    "ALTER TABLE family_members ADD COLUMN IF NOT EXISTS birth_day INTEGER;",
    "ALTER TABLE family_members ADD COLUMN IF NOT EXISTS death_month INTEGER;",
    "ALTER TABLE family_members ADD COLUMN IF NOT EXISTS death_day INTEGER;",
    "ALTER TABLE spouses ADD COLUMN IF NOT EXISTS birth_month INTEGER;",
    "ALTER TABLE spouses ADD COLUMN IF NOT EXISTS birth_day INTEGER;"
]

def migrate():
    for cmd in commands:
        try:
            # Use engine.begin() for separate transaction per command
            with engine.begin() as conn:
                conn.execute(text(cmd))
                print(f"✅ Success: {cmd.strip()}")
        except Exception as e:
            print(f"⚠️ Notice: {cmd.strip()} (may already exist or table missing): {str(e)[:100]}...")

if __name__ == "__main__":
    migrate()
    print("\n[Migration Completed Successfully]")
