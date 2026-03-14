"""
Migrate all data from SQLite → PostgreSQL.

Reads from backend/family_tree.db (SQLite)
Writes to postgresql://postgres:2002@localhost:5432/family_tree
"""
import sqlite3
import psycopg2

SQLITE_PATH = r"backend/family_tree.db"
PG_URL = "postgresql://postgres:2002@localhost:5432/family_tree"

def migrate():
    # Connect to SQLite
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    # Connect to PostgreSQL
    pg_conn = psycopg2.connect(PG_URL)
    pg_cur = pg_conn.cursor()

    # Create table in PostgreSQL
    pg_cur.execute("""
        CREATE TABLE IF NOT EXISTS family_members (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR NOT NULL,
            branch_name VARCHAR,
            parent_id INTEGER,
            image_url VARCHAR,
            gender VARCHAR,
            birth_year INTEGER,
            death_year INTEGER,
            email VARCHAR,
            phone VARCHAR,
            is_alive BOOLEAN NOT NULL DEFAULT TRUE,
            blood_type VARCHAR,
            health_notes VARCHAR
        )
    """)
    pg_cur.execute("CREATE INDEX IF NOT EXISTS idx_family_members_full_name ON family_members (full_name)")
    pg_conn.commit()

    # Check if already migrated
    pg_cur.execute("SELECT COUNT(*) FROM family_members")
    existing = pg_cur.fetchone()[0]
    if existing > 0:
        print(f"PostgreSQL already has {existing} records. Clearing table first...")
        pg_cur.execute("DELETE FROM family_members")
        pg_conn.commit()

    # Read all rows from SQLite
    sqlite_cur.execute("SELECT * FROM family_members ORDER BY id")
    columns = [desc[0] for desc in sqlite_cur.description]
    rows = sqlite_cur.fetchall()

    print(f"Found {len(rows)} records in SQLite")

    # Insert into PostgreSQL preserving IDs
    inserted = 0
    for row in rows:
        data = dict(zip(columns, row))
        data["is_alive"] = bool(data.get("is_alive", 1))

        pg_cur.execute("""
            INSERT INTO family_members (id, full_name, branch_name, parent_id,
                image_url, gender, birth_year, death_year,
                email, phone, is_alive, blood_type, health_notes)
            VALUES (%(id)s, %(full_name)s, %(branch_name)s, %(parent_id)s,
                %(image_url)s, %(gender)s, %(birth_year)s, %(death_year)s,
                %(email)s, %(phone)s, %(is_alive)s, %(blood_type)s, %(health_notes)s)
        """, data)
        inserted += 1

    # Fix the auto-increment sequence so new inserts get the right ID
    pg_cur.execute("SELECT MAX(id) FROM family_members")
    max_id = pg_cur.fetchone()[0] or 0
    pg_cur.execute(f"SELECT setval('family_members_id_seq', {max_id})")

    pg_conn.commit()

    print(f"Migrated {inserted} records to PostgreSQL")

    # Verify
    pg_cur.execute("SELECT COUNT(*) FROM family_members")
    pg_count = pg_cur.fetchone()[0]
    pg_cur.execute("SELECT COUNT(*) FROM family_members WHERE gender = 'male'")
    males = pg_cur.fetchone()[0]
    pg_cur.execute("SELECT COUNT(*) FROM family_members WHERE gender = 'female'")
    females = pg_cur.fetchone()[0]

    print(f"Verification: {pg_count} total ({males} males, {females} females)")

    sqlite_conn.close()
    pg_cur.close()
    pg_conn.close()


if __name__ == "__main__":
    migrate()
    print("Migration complete!")
