from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the Backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import models and database
from models.models import Base
from database import engine

# Import routers directly (not through __init__.py)
from routes.auth import router as auth_router
from routes.tasks import router as tasks_router

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

# Include routers with prefixes
app.include_router(auth_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)