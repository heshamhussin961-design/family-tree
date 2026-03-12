from datetime import datetime
from typing import List
from models import FamilyMember

def generate_gedcom(members: List[FamilyMember]) -> str:
    """
    Generate a GEDCOM 5.5.1 string from a list of FamilyMember objects.
    """
    lines = [
        "0 HEAD",
        "1 CHAR UTF-8",
        "1 GEDC",
        "2 VERS 5.5.1",
        "2 FORM LINEAGE-LINKED",
        "1 SUBM @S1@",
        "0 @S1@ SUBM",
        "1 NAME Family Tree App Export",
    ]

    # Map members to INDI records
    # We also need to group children by their parents to create FAM records
    families = {} # parent_id -> list of children_ids

    for m in members:
        # INDI Header
        lines.append(f"0 @I{m.id}@ INDI")
        
        # Name
        # GEDCOM format: First Name /Last Name/
        name_parts = m.full_name.split()
        if len(name_parts) > 1:
            first = " ".join(name_parts[:-1])
            last = name_parts[-1]
            lines.append(f"1 NAME {first} /{last}/")
        else:
            lines.append(f"1 NAME {m.full_name} //")

        # Gender
        if m.gender == "male":
            lines.append("1 SEX M")
        elif m.gender == "female":
            lines.append("1 SEX F")

        # Birth
        if m.birth_year:
            lines.append("1 BIRT")
            lines.append(f"2 DATE {m.birth_year}")
        
        # Death
        if not m.is_alive and m.death_year:
            lines.append("1 DEAT")
            lines.append(f"2 DATE {m.death_year}")
        elif not m.is_alive:
            lines.append("1 DEAT Y")

        # Occupation
        if m.profession or m.job_title:
            occ = m.job_title or m.profession
            lines.append(f"1 OCCU {occ}")

        # Note/Branch
        if m.branch_name:
            lines.append(f"1 NOTE Branch: {m.branch_name}")

        # Link to Family as child
        if m.parent_id:
            lines.append(f"1 FAMC @F{m.parent_id}@")
            if m.parent_id not in families:
                families[m.parent_id] = []
            families[m.parent_id].append(m.id)

        # If this person IS a parent in some FAM record
        # (We'll check this later when creating FAM records)

    # Create FAM records
    # In this simplified model, a 'family' is defined by a single parent (the parent_id)
    for parent_id, children in families.items():
        lines.append(f"0 @F{parent_id}@ FAM")
        
        # Find parent gender to assign as HUSB or WIFE
        parent = next((m for m in members if m.id == parent_id), None)
        if parent:
            if parent.gender == "female":
                lines.append(f"1 WIFE @I{parent_id}@")
            else:
                lines.append(f"1 HUSB @I{parent_id}@")
        
        for child_id in children:
            lines.append(f"1 CHIL @I{child_id}@")

    lines.append("0 TRLR")
    return "\n".join(lines)
