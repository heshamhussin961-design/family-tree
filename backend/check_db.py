import sqlite3
import sys
try:
    db = sqlite3.connect('/root/family-tree/backend/family_tree.db')
    c = db.cursor()
    c.execute('SELECT COUNT(*) FROM family_members')
    print('Members:', c.fetchone()[0])
    c.execute('SELECT COUNT(*) FROM users')
    print('Users:', c.fetchone()[0])
except Exception as e:
    print('Error:', e)
