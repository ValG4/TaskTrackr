from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Use absolute imports
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models.models import Task
from schemas.schemas import TaskCreate, TaskResponse, TaskUpdate
from crud.crud import (
    get_tasks_by_user, create_task, update_task,
    delete_task, get_task_by_id
)

router = APIRouter()

# Get all tasks for a user
@router.get("/tasks", response_model=List[TaskResponse])
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

# Get single task by ID
@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_single_task(task_id: int, db: Session = Depends(get_db)):
    try:
        print(f"🔍 Fetching single task with ID: {task_id}")
        task = get_task_by_id(db, task_id=task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        print(f"✅ Found task: {task.title}")
        return task
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching task: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error fetching task")

# Create new task
@router.post("/tasks", response_model=TaskResponse)
def create_new_task(
        task: TaskCreate,
        user_id: int,
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

# Update existing task
@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_existing_task(
        task_id: int,
        task_updates: TaskUpdate,
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

# Delete task
@router.delete("/tasks/{task_id}")
def delete_existing_task(task_id: int, db: Session = Depends(get_db)):
    success = delete_task(db=db, task_id=task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}