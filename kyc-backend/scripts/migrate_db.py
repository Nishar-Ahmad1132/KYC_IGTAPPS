from sqlalchemy import text
from app.database import engine
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    print("Migrating database using SQLAlchemy engine...")
    with engine.connect() as conn:
        print("Connected. Starting migration...")
        try:
            # Check and add password_hash
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR;"))
                print("Added column: password_hash")
            except Exception as e:
                print(f"Skipping password_hash: {e}")
            
            # Check and add is_admin
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;"))
                print("Added column: is_admin")
            except Exception as e:
                print(f"Skipping is_admin: {e}")

            # Check and add rejection_reason
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN rejection_reason VARCHAR;"))
                print("Added column: rejection_reason")
            except Exception as e:
                print(f"Skipping rejection_reason: {e}")
                
            conn.commit()
            print("Migration completed.")
        except Exception as e:
            print(f"Unexpected error: {e}")

if __name__ == "__main__":
    migrate()
