from sqlalchemy.orm import Session
import bcrypt
import sys
import os

# Add the Backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import models
from models.models import User, Task

# User CRUD operations
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, username: str, email: str, password: str):
    db_user = User(username=username, email=email)
    db_user.set_password(password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

# Task CRUD operations
def get_tasks_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Task).filter(Task.user_id == user_id).offset(skip).limit(limit).all()

def get_task_by_id(db: Session, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()

def create_task(db: Session, task_data: dict, user_id: int):
    db_task = Task(**task_data, user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_data: dict):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        for key, value in task_data.items():
            if hasattr(db_task, key) and value is not None:
                setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
        print(f"✅ Task {task_id} updated in database")
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
        print(f"✅ Task {task_id} deleted from database")
        return True
    print(f"❌ Task {task_id} not found for deletion")
    return False