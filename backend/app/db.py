import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()


class Base(DeclarativeBase):
    pass


def database_url() -> str:
    return os.getenv("DATABASE_URL", "sqlite:///./verifyhire.db")


def _engine_kwargs(url: str) -> dict[str, object]:
    return {"connect_args": {"check_same_thread": False}} if url.startswith("sqlite") else {}


engine = create_engine(database_url(), pool_pre_ping=True, **_engine_kwargs(database_url()))
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
