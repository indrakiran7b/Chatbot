from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from typing import List
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .db import get_session
from .models import Project, Prompt, User
from .core.security import decode_access_token

router = APIRouter(prefix="/projects", tags=["projects"])
auth = HTTPBearer()

def get_current_user(token: HTTPAuthorizationCredentials = Depends(auth), session: Session = Depends(get_session)):
    try:
        payload = decode_access_token(token.credentials)
        user_id = int(payload.get("sub"))
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token user")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/", response_model=List[Project])
def list_projects(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Project).where(Project.owner_id == user.id)).all()

@router.post("/", response_model=Project)
def create_project(data: dict, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    name = data.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="name required")
    p = Project(owner_id=user.id, name=name, description=data.get("description"))
    session.add(p); session.commit(); session.refresh(p)
    return p

@router.post("/{project_id}/prompts", response_model=Prompt)
def add_prompt(project_id: int, data: dict, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    proj = session.get(Project, project_id)
    if not proj or proj.owner_id != user.id:
        raise HTTPException(status_code=404, detail="project not found")
    pr = Prompt(project_id=project_id, content=data.get("content",""))
    session.add(pr); session.commit(); session.refresh(pr)
    return pr

@router.get("/{project_id}/prompts", response_model=List[Prompt])
def get_prompts(project_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Prompt).where(Prompt.project_id == project_id)).all()

@router.post("/{project_id}/upload")
def upload_file(project_id: int, file: UploadFile = File(...), user: User = Depends(get_current_user)):
    # Simple local save
    import os
    save_dir = f"./uploads/project_{project_id}"
    os.makedirs(save_dir, exist_ok=True)
    path = os.path.join(save_dir, file.filename)
    with open(path, "wb") as f:
        f.write(file.file.read())
    return {"filename": file.filename, "path": path}
