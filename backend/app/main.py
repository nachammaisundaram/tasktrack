from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import tasks, auth_routes

app = FastAPI(title="TaskTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://tasktrack-one.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, tags=["Authentication"])
app.include_router(tasks.router, tags=["Tasks"])

@app.get("/")
def root():
    return {"message": "TaskTrack API is running"}