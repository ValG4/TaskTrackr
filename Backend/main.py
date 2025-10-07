from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import List
import sys
import os

# Add the Backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Now import using absolute paths from the Backend directory
from models.models import Base, User, Task
from schemas.schemas import UserCreate, UserResponse, TaskCreate, TaskResponse, LoginRequest, TaskUpdate
from crud.crud import (
    get_user_by_email, create_user, get_tasks_by_user,
    create_task, update_task, delete_task, get_task_by_id, get_user_by_id, get_user_by_username
)
from auth.auth import verify_password, create_access_token
from config import Config

# Database setup for PostgreSQL
engine = create_engine(Config.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskTrackr API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/api/auth/register", response_model=UserResponse)
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


@app.post("/api/auth/login")
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
@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(user_id: int, db: Session = Depends(get_db)):
    try:
        print(f"🔍 Fetching tasks for user_id: {user_id}")
        tasks = get_tasks_by_user(db, user_id=user_id)
        print(f"✅ Found {len(tasks)} tasks for user {user_id}")
        return tasks
    except Exception as e:
        print(f"❌ Error fetching tasks: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error fetching tasks")


@app.post("/api/tasks", response_model=TaskResponse)
def create_new_task(
        task: TaskCreate,
        user_id: int,  # This should be a query parameter
        db: Session = Depends(get_db)
):
    try:
        print(f"🔍 Creating task for user_id: {user_id}")
        print(f"   Task data: {task.dict()}")

        task_data = task.dict()
        created_task = create_task(db=db, task_data=task_data, user_id=user_id)
        print(f"✅ Task created successfully: ID {created_task.id}")

        return created_task
    except Exception as e:
        print(f"❌ Error creating task: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error creating task")


@app.put("/api/tasks/{task_id}", response_model=TaskResponse)
def update_existing_task(
        task_id: int,
        task_updates: TaskUpdate,  # Changed from TaskCreate to TaskUpdate
        db: Session = Depends(get_db)
):
    try:
        print(f"🔍 Updating task {task_id}")
        print(f"   Update data: {task_updates.dict(exclude_unset=True)}")

        # Only include fields that were actually provided
        updates = task_updates.dict(exclude_unset=True)
        db_task = update_task(db=db, task_id=task_id, task_data=updates)

        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")

        print(f"✅ Task {task_id} updated successfully")
        return db_task

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating task: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error updating task")

@app.delete("/api/tasks/{task_id}")
def delete_existing_task(task_id: int, db: Session = Depends(get_db)):
    success = delete_task(db=db, task_id=task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)