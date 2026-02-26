"""
==============================================================================
  Family Tree Import Pipeline
  ============================================================================
  A 3-stage automated pipeline to extract family tree data from .xls files
  drawn with SmartArt/Shapes and insert them into a PostgreSQL database.

  STAGES:
    1. Excel → PNG  (via win32com.client + Excel COM automation)
    2. PNG  → JSON  (via OpenAI GPT-4o Vision or Anthropic Claude)
    3. JSON → DB    (via psycopg2 with two-pass parent resolution)

  USAGE:
    pip install pywin32 openai anthropic psycopg2-binary pillow
    python import_pipeline.py
==============================================================================
"""

import os
import re
import sys
import json
import time
import base64
import logging
import tempfile
import traceback
from pathlib import Path

# ── Third-party ───────────────────────────────────────────────────────────────
import psycopg2
import psycopg2.extras

# Pick ONE of these two Vision SDKs (configure via AI_PROVIDER below)
# pip install openai          → for GPT-4o
# pip install anthropic       → for Claude-3.5-Sonnet

# ══════════════════════════════════════════════════════════════════════════════
#  USER CONFIGURATION  ← Edit these before running
# ══════════════════════════════════════════════════════════════════════════════

# Directory that contains the .xls files
XLS_DIRECTORY = r"c:\Users\hussi\OneDrive\Desktop\family-tree\FAMILY-TREE"

# Temporary folder where sheet PNGs will be saved
TEMP_IMAGE_DIR = os.path.join(tempfile.gettempdir(), "family_tree_images")

# AI provider: "openai" | "anthropic"
AI_PROVIDER = "openai"

# OpenAI config (used when AI_PROVIDER == "openai")
OPENAI_API_KEY  = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_KEY_HERE")
OPENAI_MODEL    = "gpt-4o"

# Anthropic config (used when AI_PROVIDER == "anthropic")
ANTHROPIC_API_KEY  = os.getenv("ANTHROPIC_API_KEY", "YOUR_ANTHROPIC_KEY_HERE")
ANTHROPIC_MODEL    = "claude-3-5-sonnet-20241022"

# PostgreSQL connection
DB_CONFIG = {
    "host":     os.getenv("DB_HOST",     "localhost"),
    "port":     int(os.getenv("DB_PORT", "5432")),
    "dbname":   os.getenv("DB_NAME",     "family_tree_db"),
    "user":     os.getenv("DB_USER",     "postgres"),
    "password": os.getenv("DB_PASSWORD", "YOUR_DB_PASSWORD_HERE"),
}

# Target table name in PostgreSQL
DB_TABLE = "family_members"

# DPI for PNG export (higher = better AI accuracy, but slower)
EXPORT_DPI = 200

# ══════════════════════════════════════════════════════════════════════════════
#  LOGGING SETUP
# ══════════════════════════════════════════════════════════════════════════════
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(levelname)-8s]  %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("pipeline.log", encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)

# ══════════════════════════════════════════════════════════════════════════════
#  STAGE 1 — Excel → PNG  (win32com)
# ══════════════════════════════════════════════════════════════════════════════

def infer_branch_name(file_path: str) -> str:
    """Derive a human-readable branch name from the XLS filename."""
    stem = Path(file_path).stem
    # Remove leading numbers / special chars, keep Arabic text
    stem = re.sub(r'^[\d\s\(\)]+', '', stem).strip()
    return stem or Path(file_path).stem


def export_sheets_to_png(xls_path: str, output_dir: str) -> list[dict]:
    """
    Opens an XLS file silently via Excel COM and exports every sheet
    as a PNG image.

    Returns a list of dicts: [{"image_path": str, "sheet_name": str,
                                "branch_name": str, "xls_path": str}]
    """
    import win32com.client  # only import when actually needed

    os.makedirs(output_dir, exist_ok=True)
    exported = []
    branch_name = infer_branch_name(xls_path)

    log.info(f"Opening Excel file: {xls_path}")
    excel = None
    wb    = None
    try:
        excel = win32com.client.Dispatch("Excel.Application")
        excel.Visible          = False
        excel.DisplayAlerts    = False
        excel.ScreenUpdating   = False

        wb = excel.Workbooks.Open(
            os.path.abspath(xls_path),
            ReadOnly=True,
            UpdateLinks=False,
        )

        for ws in wb.Worksheets:
            sheet_name  = ws.Name
            safe_name   = re.sub(r'[\\/*?:"<>|]', '_', sheet_name)
            xls_stem    = Path(xls_path).stem
            safe_stem   = re.sub(r'[\\/*?:"<>|]', '_', xls_stem)
            png_name    = f"{safe_stem}__{safe_name}.png"
            png_path    = os.path.join(output_dir, png_name)

            log.info(f"  Exporting sheet '{sheet_name}' → {png_path}")

            try:
                # Copy entire sheet as a picture to the clipboard
                ws.UsedRange.CopyPicture(
                    Appearance=1,   # xlScreen
                    Format=2,       # xlBitmap
                )

                # ── Paste from clipboard and save via Pillow ──────────────
                from PIL import ImageGrab
                time.sleep(0.4)   # let clipboard settle
                img = ImageGrab.grabclipboard()

                if img is None:
                    # Fallback: export shapes only via ExportAsFixedFormat
                    log.warning(
                        f"  Clipboard empty for sheet '{sheet_name}'. "
                        "Trying PDF fallback..."
                    )
                    pdf_path = png_path.replace(".png", ".pdf")
                    wb.ExportAsFixedFormat(
                        Type=0,       # xlTypePDF
                        Filename=pdf_path,
                        Quality=0,    # xlQualityStandard
                        IncludeDocProperties=False,
                        IgnorePrintAreas=False,
                    )
                    # Convert PDF page to PNG using pdf2image
                    try:
                        from pdf2image import convert_from_path
                        pages = convert_from_path(pdf_path, dpi=EXPORT_DPI)
                        if pages:
                            pages[0].save(png_path, "PNG")
                            os.remove(pdf_path)
                    except ImportError:
                        log.warning(
                            "pdf2image not installed. Keeping PDF: "
                            + pdf_path
                        )
                        png_path = pdf_path   # use PDF path instead

                else:
                    # Resize to ~EXPORT_DPI quality (clipboard is 96 dpi)
                    scale = EXPORT_DPI / 96
                    new_w = int(img.width  * scale)
                    new_h = int(img.height * scale)
                    img = img.resize((new_w, new_h))
                    img.save(png_path, "PNG")

                exported.append({
                    "image_path": png_path,
                    "sheet_name": sheet_name,
                    "branch_name": branch_name,
                    "xls_path": xls_path,
                })
                log.info(f"  ✓ Saved: {png_path}")

            except Exception as e:
                log.error(
                    f"  ✗ Failed to export sheet '{sheet_name}': {e}"
                )

    except Exception as e:
        log.error(f"Failed to process {xls_path}: {e}")
        traceback.print_exc()

    finally:
        if wb:
            try:
                wb.Close(SaveChanges=False)
            except Exception:
                pass
        if excel:
            try:
                excel.Quit()
            except Exception:
                pass

    return exported


# ══════════════════════════════════════════════════════════════════════════════
#  STAGE 2 — PNG → JSON  (Vision LLM)
# ══════════════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = (
    "You are an expert data extractor specializing in family trees. "
    "Carefully analyze the provided family tree diagram image. "
    "Trace every connecting line to determine the parent-child relationships. "
    "Return ONLY a valid JSON array of objects — no markdown, no explanation. "
    "Each object must have exactly these keys:\n"
    '  "full_name"   : The person\'s full name as written in the diagram.\n'
    '  "parent_name" : Full name of their direct father/parent in the tree. '
    "Set to null if this person is the root (top-most ancestor).\n"
    '  "branch_name" : The branch name provided by the user.\n'
    "Do NOT miss any person. Process the entire diagram."
)


def encode_image_base64(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def extract_with_openai(image_path: str, branch_name: str) -> list[dict]:
    from openai import OpenAI

    client     = OpenAI(api_key=OPENAI_API_KEY)
    b64_image  = encode_image_base64(image_path)
    media_type = "image/png" if image_path.endswith(".png") else "application/pdf"

    log.info(f"  Sending to OpenAI {OPENAI_MODEL}...")

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{b64_image}",
                            "detail": "high",
                        },
                    },
                    {
                        "type": "text",
                        "text": (
                            f"The branch name for all people in this image is: "
                            f'"{branch_name}". '
                            "Extract all family members with their hierarchy."
                        ),
                    },
                ],
            },
        ],
        max_tokens=4096,
        temperature=0,
    )

    raw = response.choices[0].message.content.strip()
    return _parse_json_response(raw)


def extract_with_anthropic(image_path: str, branch_name: str) -> list[dict]:
    import anthropic

    client     = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    b64_image  = encode_image_base64(image_path)
    media_type = "image/png" if image_path.endswith(".png") else "application/pdf"

    log.info(f"  Sending to Anthropic {ANTHROPIC_MODEL}...")

    message = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": b64_image,
                        },
                    },
                    {
                        "type": "text",
                        "text": (
                            f"The branch name for all people in this image is: "
                            f'"{branch_name}". '
                            "Extract all family members with their hierarchy."
                        ),
                    },
                ],
            }
        ],
    )

    raw = message.content[0].text.strip()
    return _parse_json_response(raw)


def _parse_json_response(raw: str) -> list[dict]:
    """
    Robustly parse the LLM response into a Python list.
    Handles cases where the LLM wraps output in ```json ... ``` fences.
    """
    # Strip markdown fences if present
    raw = re.sub(r"^```(?:json)?", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"```$",         "", raw, flags=re.MULTILINE)
    raw = raw.strip()

    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return data
        log.error("AI returned JSON but it's not a list!")
        return []
    except json.JSONDecodeError as e:
        log.error(f"Could not parse AI JSON response: {e}")
        log.debug(f"Raw response:\n{raw}")
        return []


def ai_extract(image_path: str, branch_name: str) -> list[dict]:
    """Dispatch to the configured AI provider."""
    if AI_PROVIDER == "openai":
        return extract_with_openai(image_path, branch_name)
    elif AI_PROVIDER == "anthropic":
        return extract_with_anthropic(image_path, branch_name)
    else:
        raise ValueError(f"Unknown AI_PROVIDER: {AI_PROVIDER!r}")


# ══════════════════════════════════════════════════════════════════════════════
#  STAGE 3 — JSON → PostgreSQL  (two-pass insertion)
# ══════════════════════════════════════════════════════════════════════════════

CREATE_TABLE_SQL = f"""
CREATE TABLE IF NOT EXISTS {DB_TABLE} (
    id          SERIAL PRIMARY KEY,
    full_name   TEXT NOT NULL,
    parent_id   INTEGER REFERENCES {DB_TABLE}(id) ON DELETE SET NULL,
    parent_name TEXT,
    branch_name TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_{DB_TABLE}_name
    ON {DB_TABLE} (full_name, branch_name);
"""


def get_db_connection():
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    return conn


def ensure_table_exists(conn):
    with conn.cursor() as cur:
        cur.execute(CREATE_TABLE_SQL)
    conn.commit()
    log.info(f"Table '{DB_TABLE}' is ready.")


def insert_records(conn, records: list[dict]) -> dict:
    """
    Two-pass insertion strategy:
      Pass 1 → Insert every record (parent_id = NULL for now).
      Pass 2 → Update parent_id for all records that have a parent_name.

    Returns stats dict with counts.
    """
    inserted  = 0
    skipped   = 0
    updated   = 0
    failed    = 0

    # ── PASS 1: Insert all records ────────────────────────────────────────
    log.info(f"  Pass 1: Inserting {len(records)} records...")

    with conn.cursor() as cur:
        for rec in records:
            full_name   = (rec.get("full_name")   or "").strip()
            branch_name = (rec.get("branch_name") or "").strip()
            parent_name = (rec.get("parent_name") or "").strip() or None

            if not full_name:
                log.warning("  Skipping record with empty full_name.")
                skipped += 1
                continue

            try:
                cur.execute(
                    f"""
                    INSERT INTO {DB_TABLE} (full_name, parent_name, branch_name)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (full_name, branch_name) DO NOTHING
                    RETURNING id
                    """,
                    (full_name, parent_name, branch_name),
                )
                result = cur.fetchone()
                if result:
                    inserted += 1
                    log.info(
                        f"    ✓ Inserted: {full_name!r} "
                        f"(parent: {parent_name!r})"
                    )
                else:
                    skipped += 1
                    log.info(f"    ~ Skipped (duplicate): {full_name!r}")

            except Exception as e:
                log.error(f"    ✗ Insert failed for {full_name!r}: {e}")
                conn.rollback()
                failed += 1
                continue

    conn.commit()
    log.info(f"  Pass 1 complete — inserted: {inserted}, skipped: {skipped}")

    # ── PASS 2: Resolve parent_id via parent_name ─────────────────────────
    log.info("  Pass 2: Resolving parent_id references...")

    with conn.cursor() as cur:
        cur.execute(
            f"""
            SELECT id, full_name, branch_name
            FROM {DB_TABLE}
            WHERE parent_name IS NOT NULL AND parent_id IS NULL
            """
        )
        rows_needing_parent = cur.fetchall()

    log.info(
        f"  Found {len(rows_needing_parent)} records needing parent_id resolution."
    )

    with conn.cursor() as cur:
        for row_id, full_name, branch_name in rows_needing_parent:
            # Fetch parent_name for this record
            cur.execute(
                f"SELECT parent_name FROM {DB_TABLE} WHERE id = %s",
                (row_id,),
            )
            parent_name_row = cur.fetchone()
            if not parent_name_row or not parent_name_row[0]:
                continue

            parent_name = parent_name_row[0].strip()

            # Look up the parent within the same branch first, then globally
            cur.execute(
                f"""
                SELECT id FROM {DB_TABLE}
                WHERE full_name = %s
                  AND (branch_name = %s OR branch_name IS NOT NULL)
                ORDER BY (branch_name = %s) DESC
                LIMIT 1
                """,
                (parent_name, branch_name, branch_name),
            )
            parent_row = cur.fetchone()

            if parent_row:
                parent_id = parent_row[0]
                cur.execute(
                    f"UPDATE {DB_TABLE} SET parent_id = %s WHERE id = %s",
                    (parent_id, row_id),
                )
                updated += 1
                log.info(
                    f"    ✓ Linked: {full_name!r} → parent_id={parent_id} "
                    f"({parent_name!r})"
                )
            else:
                log.warning(
                    f"    ⚠ Parent not found in DB: {parent_name!r} "
                    f"(child: {full_name!r})"
                )
                failed += 1

    conn.commit()
    log.info(f"  Pass 2 complete — parent_id updated for {updated} records.")

    return {
        "inserted": inserted,
        "skipped":  skipped,
        "updated":  updated,
        "failed":   failed,
    }


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN ORCHESTRATOR
# ══════════════════════════════════════════════════════════════════════════════

def find_xls_files(directory: str) -> list[str]:
    directory = Path(directory)
    files = list(directory.glob("*.xls")) + list(directory.glob("*.xlsm"))
    log.info(f"Found {len(files)} XLS file(s) in {directory}")
    return [str(f) for f in files]


def run_pipeline():
    log.info("=" * 70)
    log.info("  Family Tree Import Pipeline — Starting")
    log.info("=" * 70)

    # ── DB connection ──────────────────────────────────────────────────────
    log.info("\n[DB] Connecting to PostgreSQL...")
    try:
        conn = get_db_connection()
        ensure_table_exists(conn)
    except Exception as e:
        log.critical(f"Cannot connect to PostgreSQL: {e}")
        sys.exit(1)

    # ── Discover XLS files ─────────────────────────────────────────────────
    xls_files = find_xls_files(XLS_DIRECTORY)
    if not xls_files:
        log.warning("No .xls files found. Exiting.")
        conn.close()
        return

    # ── Global stats ───────────────────────────────────────────────────────
    total_stats = {"inserted": 0, "skipped": 0, "updated": 0, "failed": 0}

    for xls_path in xls_files:
        file_stem = Path(xls_path).stem
        log.info(f"\n{'─' * 60}")
        log.info(f"Processing file: {file_stem}")
        log.info(f"{'─' * 60}")

        # ── STAGE 1: Export sheets to PNG ─────────────────────────────────
        log.info("[Stage 1] Exporting Excel sheets to PNG...")
        try:
            exported_sheets = export_sheets_to_png(xls_path, TEMP_IMAGE_DIR)
        except Exception as e:
            log.error(f"Stage 1 failed for {file_stem}: {e}")
            traceback.print_exc()
            continue

        if not exported_sheets:
            log.warning(f"No sheets exported from {file_stem}. Skipping.")
            continue

        log.info(f"  Exported {len(exported_sheets)} sheet(s).")

        for sheet_info in exported_sheets:
            image_path  = sheet_info["image_path"]
            branch_name = sheet_info["branch_name"]
            sheet_name  = sheet_info["sheet_name"]

            log.info(
                f"\n  Sheet: '{sheet_name}' | Branch: '{branch_name}'"
            )

            # ── STAGE 2: AI Vision extraction ─────────────────────────────
            log.info("[Stage 2] Extracting family tree via AI Vision...")
            try:
                records = ai_extract(image_path, branch_name)
            except Exception as e:
                log.error(f"Stage 2 failed for sheet '{sheet_name}': {e}")
                traceback.print_exc()
                continue

            if not records:
                log.warning(
                    f"  AI returned no records for sheet '{sheet_name}'."
                )
                continue

            log.info(f"  AI extracted {len(records)} person(s).")

            # ── STAGE 3: Insert into DB ────────────────────────────────────
            log.info("[Stage 3] Inserting into PostgreSQL...")
            try:
                stats = insert_records(conn, records)
            except Exception as e:
                log.error(f"Stage 3 failed for sheet '{sheet_name}': {e}")
                traceback.print_exc()
                continue

            # Accumulate stats
            for k in total_stats:
                total_stats[k] += stats.get(k, 0)

    # ── Summary ────────────────────────────────────────────────────────────
    log.info(f"\n{'=' * 70}")
    log.info("  Pipeline Complete — Summary")
    log.info(f"{'=' * 70}")
    log.info(f"  ✓ Inserted   : {total_stats['inserted']}")
    log.info(f"  ~ Skipped    : {total_stats['skipped']}  (duplicates)")
    log.info(f"  ✓ Parent IDs : {total_stats['updated']}  (resolved)")
    log.info(f"  ✗ Failed     : {total_stats['failed']}")
    log.info(f"{'=' * 70}\n")

    conn.close()


if __name__ == "__main__":
    run_pipeline()
