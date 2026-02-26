import xlrd, sys

sys.stdout.reconfigure(encoding='utf-8')

f = r'C:\Users\hussi\OneDrive\Desktop\family-tree\FAMILY-TREE\6سجل آل أبوعلي البيطار (1) (1).xls'
wb = xlrd.open_workbook(f)
sh = wb.sheets()[0]

# اطبع أول 130 صف مع نوع الخلية
print(f"rows={sh.nrows}, cols={sh.ncols}")
for r in [3,4,5,6,7,8,100,105,106,107,108,109,110,112]:
    row_vals  = [(sh.cell_type(r, c), repr(sh.cell_value(r, c))) for c in range(min(12, sh.ncols))]
    non_empty = [(c, t, v) for c, (t, v) in enumerate(row_vals) if v != "''"]
    if non_empty:
        print(f"ROW {r:4d}: {non_empty}")
