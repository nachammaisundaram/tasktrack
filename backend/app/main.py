from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import tasks, auth_routes

app = FastAPI(title="TaskTrack API")

# CORS - Frontend (React) backend ah access panna permission kudukurathukku
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # production la specific frontend URL podanum, ippo testing ku "*" okay
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes connect pannurathu
app.include_router(auth_routes.router, tags=["Authentication"])
app.include_router(tasks.router, tags=["Tasks"])

@app.get("/")
def root():
    return {"message": "TaskTrack API is running"}