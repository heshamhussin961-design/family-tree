"""
=============================================================================
  Family Registry Importer v2 — سجل آل أبو علي البيطار
=============================================================================
الملف بنيته:
  Row N   → يحتوي على الاسم (في إحدى الخلايا)
  Row N+2 → يحتوي على الرقم العائلي (مثل 1-2-3-0-0-0)

الخوارزمية:
  1. نجمع locations كل خلية بها رقم عائلي
  2. نجمع locations كل خلية بها نص عربي
  3. لكل رقم عائلي نبحث عن أقرب اسم عربي في نطاق ±10 صفوف
  4. نحدد العلاقات الأبوية من الرقم الهرمي
  5. ندرج في SQLite بـ two-pass
=============================================================================
"""
import re
import sys
import logging
import sqlite3
from pathlib import Path

import xlrd

# ─── CONFIG ──────────────────────────────────────────────────────────────────
XLS_PATH = Path(r"c:\Users\hussi\OneDrive\Desktop\family-tree\FAMILY-TREE\6سجل آل أبوعلي البيطار (1) (1).xls")
DB_PATH  = Path(r"c:\Users\hussi\OneDrive\Desktop\family-tree\backend\family_tree.db")
BRANCH   = "آل أبو علي البيطار"
ROW_WINDOW = 10   # look ±N rows around the family-number row to find a name

# ─── LOGGING ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(levelname)-8s]  %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("import_registry.log", encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)

# ─── REGEX PATTERNS ──────────────────────────────────────────────────────────
# Western digits: 1-2-3-0-0
FNUM_WESTERN = re.compile(r"^(\d+)(-\d+){2,}$")
# Arabic-Indic digits: ١-٢-٣  (mapped to western)
ARABIC_DIGIT = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
# Arabic text detector
HAS_ARABIC   = re.compile(r"[\u0600-\u06FF]{2,}")
# Labels/headers to SKIP (not real names)
SKIP_LABELS  = {
    "الرقم العائلي", "الـرقـم", "الاسم", "اسم الاب", "ابن", "بن",
    "اسم الأب", "رقم الصفحة", "الفرع", "الملاحظات", "ت", "م",
    "إحصائيات", "الإجمالي", "الكلي", "البيان", "الأصول", "الفروع",
}

def normalize_fnum(val: str) -> str | None:
    """Return normalized family number or None."""
    v = val.strip().translate(ARABIC_DIGIT)
    # Remove any whitespace inside
    v = re.sub(r"\s+", "", v)
    if FNUM_WESTERN.match(v):
        return v
    return None

def parent_of(fnum: str) -> str | None:
    """Compute parent family number by zeroing the last non-zero segment."""
    parts = [int(x) for x in fnum.split("-")]
    nz = [i for i, v in enumerate(parts) if v != 0]
    if len(nz) <= 1:
        return None
    parts[nz[-1]] = 0
    return "-".join(str(p) for p in parts)

def looks_like_name(val: str) -> bool:
    """Rough heuristic: Arabic text, reasonable length, not a header label."""
    v = val.strip()
    if not HAS_ARABIC.search(v):
        return False
    if any(skip in v for skip in SKIP_LABELS):
        return False
    if len(v) < 2 or len(v) > 80:
        return False
    # Reject cells that are mostly numbers
    if sum(c.isdigit() for c in v) > len(v) * 0.4:
        return False
    return True

# ─── STEP 1: Read XLS ────────────────────────────────────────────────────────
def read_registry() -> list[dict]:
    log.info(f"Opening: {XLS_PATH.name}")
    wb = xlrd.open_workbook(str(XLS_PATH))
    sh = wb.sheet_by_index(0)
    log.info(f"Sheet: {sh.nrows} rows × {sh.ncols} cols")

    # ── Collect all family-number positions ──────────────────────────────
    fnum_positions: list[tuple[int, int, str]] = []  # (row, col, fnum)
    # Collect all name positions: row → list of candidate names
    name_by_row: dict[int, list[str]] = {}

    for r in range(sh.nrows):
        found_fnum_this_row = False
        for c in range(sh.ncols):
            cell = sh.cell(r, c)
            if cell.ctype == 0:
                continue
            raw = str(cell.value).strip()
            if not raw:
                continue

            # Check if it's a family number
            fnum = normalize_fnum(raw)
            if fnum:
                fnum_positions.append((r, c, fnum))
                found_fnum_this_row = True
                continue

            # Check if it looks like a name
            if looks_like_name(raw):
                name_by_row.setdefault(r, []).append(raw.strip())

    log.info(f"  → Family numbers found: {len(fnum_positions)}")
    log.info(f"  → Rows with name candidates: {len(name_by_row)}")

    if not fnum_positions:
        log.error("NO family numbers found at all! Dumping 20 non-empty cells for diagnosis:")
        count = 0
        for r in range(sh.nrows):
            for c in range(sh.ncols):
                cell = sh.cell(r, c)
                if cell.ctype != 0:
                    raw = repr(str(cell.value).strip())
                    log.error(f"  Row {r}, Col {c}: {raw}")
                    count += 1
                    if count >= 20:
                        return []
        return []

    # ── Match each family number to the nearest name ──────────────────────
    records: list[dict] = []
    seen_fnums: set[str] = set()

    for (frow, fcol, fnum) in fnum_positions:
        if fnum in seen_fnums:
            continue

        # Search window around frow
        best_name  = None
        best_dist  = ROW_WINDOW + 1

        for r in range(max(0, frow - ROW_WINDOW), min(sh.nrows, frow + ROW_WINDOW + 1)):
            if r not in name_by_row:
                continue
            for name in name_by_row[r]:
                dist = abs(r - frow)
                if dist < best_dist:
                    best_dist = dist
                    best_name = name

        if not best_name:
            continue

        seen_fnums.add(fnum)
        records.append({
            "family_number": fnum,
            "full_name":     best_name,
            "branch_name":   BRANCH,
            "parent_number": parent_of(fnum),
        })

    # Sort by family number depth (roots first)
    records.sort(key=lambda r: r["family_number"].count("-"))
    log.info(f"  → Matched records: {len(records)}")
    return records

# ─── STEP 2: Insert into SQLite ──────────────────────────────────────────────
def insert_to_db(records: list[dict]):
    conn = sqlite3.connect(str(DB_PATH))
    cur  = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS family_members (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name   TEXT NOT NULL,
            branch_name TEXT,
            parent_id   INTEGER REFERENCES family_members(id) ON DELETE SET NULL,
            image_url   TEXT,
            gender      TEXT,
            birth_year  INTEGER,
            death_year  INTEGER,
            email       TEXT,
            phone       TEXT
        )
    """)
    conn.commit()

    fnum_to_id: dict[str, int] = {}
    inserted = skipped = updated = missing = 0

    # ── PASS 1: Insert all ────────────────────────────────────────────────
    log.info("Pass 1: inserting records...")
    for rec in records:
        cur.execute(
            "SELECT id FROM family_members WHERE full_name=? AND branch_name=?",
            (rec["full_name"], rec["branch_name"]),
        )
        row = cur.fetchone()
        if row:
            fnum_to_id[rec["family_number"]] = row[0]
            skipped += 1
            continue

        cur.execute(
            "INSERT INTO family_members (full_name, branch_name) VALUES (?, ?)",
            (rec["full_name"], rec["branch_name"]),
        )
        fnum_to_id[rec["family_number"]] = cur.lastrowid
        inserted += 1

    conn.commit()
    log.info(f"  inserted={inserted}  skipped={skipped}")

    # ── PASS 2: Resolve parent_id ─────────────────────────────────────────
    log.info("Pass 2: resolving parent_id...")
    for rec in records:
        child_id   = fnum_to_id.get(rec["family_number"])
        parent_num = rec["parent_number"]
        if child_id is None or parent_num is None:
            continue
        parent_id = fnum_to_id.get(parent_num)
        if parent_id is None:
            missing += 1
            continue
        cur.execute(
            "UPDATE family_members SET parent_id=? WHERE id=? AND parent_id IS NULL",
            (parent_id, child_id),
        )
        updated += 1

    conn.commit()
    conn.close()
    log.info(f"  parent_id resolved={updated}  missing={missing}")
    return inserted, skipped, updated, missing

# ─── MAIN ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    log.info("=" * 65)
    log.info("Family Registry Importer v2")
    log.info("=" * 65)

    records = read_registry()

    if not records:
        log.error("Nothing extracted. See diagnosis above.")
        sys.exit(1)

    log.info("\nPreview (first 8):")
    for r in records[:8]:
        log.info(f"  [{r['family_number']:25s}] {r['full_name']!r}  ← parent: {r['parent_number']}")

    ins, skp, upd, mis = insert_to_db(records)

    log.info("\n" + "=" * 65)
    log.info(f"  ✓ Inserted          : {ins}")
    log.info(f"  ~ Skipped (dup)     : {skp}")
    log.info(f"  ✓ parent_id linked  : {upd}")
    log.info(f"  ⚠ Missing parents   : {mis}")
    log.info("=" * 65)
