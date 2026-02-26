"""
استيراد عائلة آل أبوعلي البيطار من ملف السجل
البنية:
  ROW n   → col 1 = 'الـرقـم العائـلـي'  + col 7 = اسم الشخص
  ROW n+2 → col 1 = الرقم العائلي مثل '1-1-0-0-...'
"""

import re
import logging
from pathlib import Path
from typing import Dict, List, Optional

from sqlalchemy.orm import Session
from db import SessionLocal, engine, Base
from models import FamilyMember

Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

FOLDER = Path(__file__).resolve().parent.parent / "FAMILY-TREE"


# ─── نظام الأرقام العائلية ─────────────────────────────────────────────────

def normalize_num(raw: str) -> str:
    """'1-1-0-0-0-0-0-0-0-0' → '1-1'"""
    parts = raw.strip().split('-')
    while parts and parts[-1] == '0':
        parts.pop()
    return '-'.join(parts) if parts else '0'


def parent_num(raw: str) -> Optional[str]:
    """
    '1-2-3' → '1-2'
    '1-2'   → '1'
    '1'     → None (جذر)
    """
    norm = normalize_num(raw)
    parts = norm.split('-')
    if len(parts) <= 1:
        return None
    return '-'.join(parts[:-1])


def is_family_num(s: str) -> bool:
    """هل النص رقم عائلي مثل 1-1-2-0-0...؟"""
    s = s.strip()
    if re.match(r'^\d+(-\d+){1,}$', s):
        return True
    return False


def clean_name(val) -> Optional[str]:
    s = re.sub(r'[ـ]', '', str(val))   # حذف الكشيدة
    s = re.sub(r'\s+', ' ', s).strip()
    return s or None


# ─── قراءة ملف سجل البيطار ─────────────────────────────────────────────────

def parse_register(path: Path, branch: str) -> List[Dict]:
    """
    يمسح الملف بحثًا عن هيكل:
      صف يحتوي 'الرقم العائلي' في col 1  →  اسم في col 7
      بعده بـ 1-3 صفوف: الرقم العائلي الرقمي في col 1
    """
    import xlrd

    people: List[Dict] = []
    wb = xlrd.open_workbook(str(path))
    sh = wb.sheets()[0]
    logging.info("📄 %s | صفوف: %d", path.name, sh.nrows)

    r = 0
    while r < sh.nrows:
        val_c1 = str(sh.cell_value(r, 1)).strip()
        # إزالة الكشيدة والمسافات الزائدة قبل المقارنة
        val_clean = re.sub(r'[ـ\s]+', '', val_c1)
        # كشف سطر "الرقم العائلي"
        if 'الرقم' in val_clean and 'العائل' in val_clean:
            # استخرج الاسم من col 7 (أو أقرب خلية غير فاضية في نفس الصف)
            name = None
            for nc in [7, 6, 8, 5, 9]:
                candidate = clean_name(sh.cell_value(r, nc))
                if candidate:
                    name = candidate
                    break

            # ابحث عن رقم العائلة في الصفوف التالية (1 إلى 4 صفوف)
            fnum = None
            for delta in range(1, 6):
                nr = r + delta
                if nr >= sh.nrows:
                    break
                candidate_num = str(sh.cell_value(nr, 1)).strip()
                if is_family_num(candidate_num):
                    fnum = candidate_num
                    r = nr  # ابدأ البحث من هنا للصف التالي
                    break

            if name and fnum:
                people.append({
                    "full_name":     name,
                    "family_number": fnum,
                    "branch_name":   branch,
                })
        r += 1

    return people


# ─── إدخال الداتابيز ───────────────────────────────────────────────────────

def insert_people(people: List[Dict], db: Session) -> None:
    if not people:
        return

    num_to_member: Dict[str, FamilyMember] = {}

    for p in people:
        m = FamilyMember(
            full_name=p["full_name"],
            branch_name=p["branch_name"],
        )
        db.add(m)
        norm = normalize_num(p["family_number"])
        # لو فيه تكرار في الرقم، خليه يُكتب
        num_to_member[norm] = m

    db.flush()

    links = 0
    for p in people:
        norm = normalize_num(p["family_number"])
        pnum = parent_num(p["family_number"])
        if pnum is None:
            continue
        child = num_to_member.get(norm)
        parent = num_to_member.get(pnum)
        if child and parent and child.id != parent.id:
            child.parent_id = parent.id
            links += 1

    db.commit()
    logging.info("✅ أُدخل %d شخص | ربط %d علاقة أب", len(people), links)


# ─── main ──────────────────────────────────────────────────────────────────

def main():
    import xlrd

    files = list(FOLDER.glob("*.xls")) + list(FOLDER.glob("*.xlsx"))
    if not files:
        logging.error("❌ لا توجد ملفات في: %s", FOLDER)
        return

    db = SessionLocal()
    total = 0
    try:
        for path in files:
            branch = re.sub(r'\s*\(\d+\)\s*', '', path.stem).strip()

            # ملفات الشجرة الرسومية (صفوف = 0)
            try:
                wb = xlrd.open_workbook(str(path))
                rows = sum(s.nrows for s in wb.sheets())
            except Exception:
                rows = 0

            if rows == 0:
                logging.info("⏭ %s (شجرة رسومية، تخطّي)", path.name)
                continue

            people = parse_register(path, branch)

            if not people:
                logging.warning("⚠️ %s: لم تُعثر على أشخاص", path.name)
                continue

            logging.info("👥 %s → %d شخص", path.name, len(people))
            insert_people(people, db)
            total += len(people)

    except Exception as e:
        logging.exception("خطأ: %s", e)
        db.rollback()
    finally:
        db.close()

    logging.info("🎉 الاستيراد اكتمل: مجموع %d شخص", total)


if __name__ == "__main__":
    main()
