import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Default to SQLite for fast, reliable offline local development if remote Postgres is unreachable
DEFAULT_SQLITE_URL = "sqlite:///./annapurna.db"

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = DEFAULT_SQLITE_URL

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)
        # Test connection
        with engine.connect() as conn:
            pass
except Exception as e:
    print(f"Warning: Primary database connection failed ({e}). Falling back to local SQLite.")
    DATABASE_URL = DEFAULT_SQLITE_URL
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def run_sqlite_migrations(engine):
    """Safely adds missing columns to existing SQLite tables if they do not exist."""
    with engine.connect() as conn:
        try:
            # Check meals columns
            meals_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(meals)").fetchall()]
            if meals_cols:
                if "start_hour" not in meals_cols:
                    conn.exec_driver_sql("ALTER TABLE meals ADD COLUMN start_hour INTEGER DEFAULT 12")
                if "start_minute" not in meals_cols:
                    conn.exec_driver_sql("ALTER TABLE meals ADD COLUMN start_minute INTEGER DEFAULT 30")
                if "end_hour" not in meals_cols:
                    conn.exec_driver_sql("ALTER TABLE meals ADD COLUMN end_hour INTEGER DEFAULT 14")
                if "end_minute" not in meals_cols:
                    conn.exec_driver_sql("ALTER TABLE meals ADD COLUMN end_minute INTEGER DEFAULT 0")
                if "cutoff_minutes_before_start" not in meals_cols:
                    conn.exec_driver_sql("ALTER TABLE meals ADD COLUMN cutoff_minutes_before_start INTEGER DEFAULT 60")

            # Check institutions columns
            inst_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(institutions)").fetchall()]
            if inst_cols and "qr_secret" not in inst_cols:
                conn.exec_driver_sql("ALTER TABLE institutions ADD COLUMN qr_secret TEXT DEFAULT 'sec_annapurna_mess_qr_key_2026'")

            # Check attendance columns
            att_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(attendance)").fetchall()]
            if att_cols:
                if "verification_method" not in att_cols:
                    conn.exec_driver_sql("ALTER TABLE attendance ADD COLUMN verification_method TEXT DEFAULT 'MESS_QR'")
                if "verified_at" not in att_cols:
                    conn.exec_driver_sql("ALTER TABLE attendance ADD COLUMN verified_at TIMESTAMP")
                if "updated_at" not in att_cols:
                    conn.exec_driver_sql("ALTER TABLE attendance ADD COLUMN updated_at TIMESTAMP")

            # Check coupons columns
            cpn_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(coupons)").fetchall()]
            if cpn_cols:
                if "milestone_cycle" not in cpn_cols:
                    conn.exec_driver_sql("ALTER TABLE coupons ADD COLUMN milestone_cycle INTEGER DEFAULT 1")
                if "redeemed_by_manager_id" not in cpn_cols:
                    conn.exec_driver_sql("ALTER TABLE coupons ADD COLUMN redeemed_by_manager_id INTEGER")

            conn.commit()
        except Exception as e:
            print(f"Migration notice: {e}")

try:
    run_sqlite_migrations(engine)
except Exception:
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

