import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

load_dotenv()

default_sqlite_path = Path(__file__).resolve().parent / "family_tree.db"
env_url = os.getenv("DATABASE_URL")

# نُجبر التطبيق حاليًا على استخدام SQLite ملف محلي
if env_url and env_url.startswith("sqlite"):
    DATABASE_URL = env_url
else:
    DATABASE_URL = f"sqlite:///{default_sqlite_path}"

engine = create_engine(
    DATABASE_URL,
    future=True,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

Base = declarative_base()


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

