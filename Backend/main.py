from Backend.models.models import Base
from Backend.config import engine
from Backend.auth.auth import router as auth_router


app = FastAPI(title="TaskTrackr")

# Create DB tables
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "TaskTrackr API running"}
