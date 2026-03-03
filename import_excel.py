"""
Import family data from the Excel register into the SQLite database.

The Excel file uses a hierarchical numbering system like "1-1-1-0-0-0-0-0-0-0"
where each non-zero digit represents a generation level, and the value indicates
which child number this person is within that generation.

Usage:
    python import_excel.py
"""
import sqlite3
import re
from pathlib import Path

import xlrd

EXCEL_PATH = Path(r"FAMILY-TREE/6سجل آل أبوعلي البيطار (1) (1).xls")
DB_PATH = Path(r"backend/family_tree.db")


def clean_name(name: str) -> str:
    """Remove decorative characters and extra spaces from Arabic names."""
    name = re.sub(r"[ـ]+", "", name)
    name = " ".join(name.split())
    return name.strip()


def parse_excel():
    """Parse the Excel file and extract person blocks."""
    wb = xlrd.open_workbook(str(EXCEL_PATH))
    sh = wb.sheet_by_index(0)

    persons = []
    current_name = None
    current_number = None
    current_children = []
    current_desc = None

    for i in range(sh.nrows):
        row = sh.row_values(i)

        if row[1] and "الـرقــــم العائـلـــــــي" in str(row[1]):
            if current_name:
                persons.append({
                    "name": clean_name(current_name),
                    "number": current_number,
                    "desc": current_desc,
                    "children": current_children,
                })
            current_name = str(row[7]).strip() if row[7] else None
            current_number = None
            current_desc = None
            current_children = []
            continue

        if row[1] and "-" in str(row[1]):
            stripped = str(row[1]).strip().replace("-", "").replace(" ", "")
            if stripped.isdigit():
                current_number = str(row[1]).strip()
                continue

        col0 = str(row[0]).strip()
        if col0 and ("إبن" in col0 or "ابن" in col0):
            current_desc = col0
            continue

        col11 = str(row[11]).strip()
        if col11 and ("ذكر" in col11 or "انث" in col11 or "أنث" in col11):
            gender = "male" if "ذكر" in col11 else "female"
            child_name = str(row[13]).strip() if row[13] else ""
            if child_name and "إسم" not in child_name:
                current_children.append({"name": clean_name(child_name), "gender": gender})

    if current_name:
        persons.append({
            "name": clean_name(current_name),
            "number": current_number,
            "desc": current_desc,
            "children": current_children,
        })

    return persons


def get_parent_number(family_number: str) -> str | None:
    """
    Given a family number like '1-1-1-1-2-0-0-0-0-0',
    return the parent's number by zeroing the last non-zero position.
    """
    parts = family_number.split("-")
    last_nonzero = -1
    for i, p in enumerate(parts):
        if p.strip() != "0":
            last_nonzero = i

    if last_nonzero <= 0:
        return None

    parent_parts = parts[:]
    parent_parts[last_nonzero] = "0"
    return "-".join(parent_parts)


def import_to_db(persons):
    """Insert parsed persons into the SQLite database."""
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    existing = cur.execute("SELECT COUNT(*) FROM family_members").fetchone()[0]
    if existing > 0:
        print(f"Database already has {existing} members. Skipping import to avoid duplicates.")
        print("To reimport, delete all records first or use an empty database.")
        conn.close()
        return

    number_to_id = {}

    for p in persons:
        if not p["number"] or not p["name"]:
            continue

        parent_num = get_parent_number(p["number"])
        parent_id = number_to_id.get(parent_num) if parent_num else None

        cur.execute(
            """INSERT INTO family_members
               (full_name, branch_name, parent_id, gender, is_alive)
               VALUES (?, ?, ?, ?, ?)""",
            (p["name"], None, parent_id, "male", 1),
        )
        person_db_id = cur.lastrowid
        number_to_id[p["number"]] = person_db_id

        for child in p["children"]:
            child_number = None
            for other in persons:
                if other["number"] and other["name"]:
                    pn = get_parent_number(other["number"])
                    if pn == p["number"] and clean_name(other["name"]) == child["name"]:
                        child_number = other["number"]
                        break

            if not child_number:
                cur.execute(
                    """INSERT INTO family_members
                       (full_name, branch_name, parent_id, gender, is_alive)
                       VALUES (?, ?, ?, ?, ?)""",
                    (child["name"], None, person_db_id, child["gender"], 1),
                )

    conn.commit()
    total = cur.execute("SELECT COUNT(*) FROM family_members").fetchone()[0]
    males = cur.execute("SELECT COUNT(*) FROM family_members WHERE gender='male'").fetchone()[0]
    females = cur.execute("SELECT COUNT(*) FROM family_members WHERE gender='female'").fetchone()[0]
    print(f"Import complete! Total: {total} members ({males} males, {females} females)")
    conn.close()


if __name__ == "__main__":
    print("Parsing Excel file...")
    persons = parse_excel()
    print(f"Found {len(persons)} person blocks in the register")

    print("Importing to database...")
    import_to_db(persons)
    print("Done!")
