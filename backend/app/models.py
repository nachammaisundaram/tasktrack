from pydantic import BaseModel, Field
from typing import Optional

# User registration/login ku use aagum structure
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# Task create/update ku use aagum structure
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "Pending"   # "Pending" or "Done"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None