from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Use absolute imports
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from schemas.schemas import UserCreate, UserResponse, LoginRequest
from crud.crud import get_user_by_email, create_user, get_user_by_username
from auth.auth import create_access_token

router = APIRouter()

@router.post("/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if email already exists
        db_user = get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Check if username already exists
        db_user = get_user_by_username(db, username=user.username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already taken")

        # Create user
        new_user = create_user(db=db, username=user.username, email=user.email, password=user.password)

        # Return the user data (without password)
        return {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "created_at": new_user.created_at
        }

    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/auth/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    try:
        print(f"🔍 Login attempt received:")
        print(f"   Email: {login_data.email}")
        print(f"   Password: {login_data.password}")

        user = get_user_by_email(db, email=login_data.email)
        if not user:
            print("❌ User not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        print(f"✅ User found: {user.username}")
        print(f"   Stored hash: {user.password_hash}")

        # Verify password
        if not user.check_password(login_data.password):
            print("❌ Password incorrect")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        print("✅ Password verified successfully")
        access_token = create_access_token(data={"sub": user.email})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")