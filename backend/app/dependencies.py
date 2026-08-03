from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Role

def get_current_user(db: Session = Depends(get_db)) -> User:
    """Mocked to return the default doctor, bypassing JWT authentication."""
    user = db.query(User).filter(User.role == Role.DOCTOR).first()
    if not user:
        # Fallback in case the DB is completely empty or seeded differently
        user = db.query(User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No users found in database to mock authentication."
        )
    return user


def require_role(*roles):
    """Mocked to completely bypass role checks."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        return current_user
    return role_checker
