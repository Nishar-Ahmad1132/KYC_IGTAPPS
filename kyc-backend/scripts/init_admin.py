from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.utils.auth import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_email = "admin@igt.com"
        existing = db.query(User).filter(User.email == admin_email).first()
        
        if existing:
            print(f"Admin {admin_email} already exists. Updating to admin status...")
            existing.is_admin = True
            db.commit()
            return

        new_admin = User(
            first_name="System",
            last_name="Admin",
            email=admin_email,
            mobile="0000000000",
            pan_number="ADMIN0001A",
            password_hash=get_password_hash("admin123"), # Change this later!
            is_admin=True,
            kyc_status="VERIFIED"
        )
        
        db.add(new_admin)
        db.commit()
        print(f"Admin created successfully!")
        print(f"Email: {admin_email}")
        print(f"Password: admin123")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
