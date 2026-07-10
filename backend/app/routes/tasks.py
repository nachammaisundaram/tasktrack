from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import tasks_collection
from app.models import TaskCreate, TaskUpdate
from app.auth import verify_token
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Idhu ovvoru route ku munnadi run aagum - token valid-ah irukka check pannum
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload.get("sub")

# Helper - MongoDB oda _id (ObjectId) ah string ah convert pannurathukku
def task_serializer(task):
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description"),
        "status": task["status"]
    }

# CREATE - Puthu task add pannurathukku
@router.post("/tasks")
def create_task(task: TaskCreate, user: str = Depends(get_current_user)):
    new_task = task.dict()
    new_task["owner"] = user
    result = tasks_collection.insert_one(new_task)
    created_task = tasks_collection.find_one({"_id": result.inserted_id})
    return task_serializer(created_task)

# READ - Ella tasks um pakkurathukku (filter option kooda)
@router.get("/tasks")
def get_tasks(status: str = None, user: str = Depends(get_current_user)):
    query = {"owner": user}
    if status:
        query["status"] = status
    tasks = tasks_collection.find(query)
    return [task_serializer(task) for task in tasks]

# UPDATE - Task edit pannurathukku
@router.put("/tasks/{task_id}")
def update_task(task_id: str, task: TaskUpdate, user: str = Depends(get_current_user)):
    existing = tasks_collection.find_one({"_id": ObjectId(task_id), "owner": user})
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = {k: v for k, v in task.dict().items() if v is not None}
    tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})
    updated_task = tasks_collection.find_one({"_id": ObjectId(task_id)})
    return task_serializer(updated_task)

# DELETE - Task remove pannurathukku
@router.delete("/tasks/{task_id}")
def delete_task(task_id: str, user: str = Depends(get_current_user)):
    result = tasks_collection.delete_one({"_id": ObjectId(task_id), "owner": user})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}