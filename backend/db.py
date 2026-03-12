import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
default_sqlite_path = Path(__file__).resolve().parent / "family_tree.db"

if not DATABASE_URL or DATABASE_URL == "sqlite:///family_tree.db":
    DATABASE_URL = f"sqlite:///{default_sqlite_path}"

connect_args = {}
pool_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    pool_args = {"pool_size": 10, "max_overflow": 20, "pool_pre_ping": True}

engine = create_engine(
    DATABASE_URL,
    future=True,
    connect_args=connect_args,
    **pool_args,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

Base = declarative_base()


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
