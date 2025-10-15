from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import Config

# Database setup for PostgreSQL
engine = create_engine(Config.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()