from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, Session
from fastapi.security import OAuth2PasswordRequestForm
from .models import User
from .db import get_session
from .core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user_in: dict, session: Session = Depends(get_session)):
    email = user_in.get("email"); password = user_in.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="email and password required")
    existing = session.exec(select(User).where(User.email == email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=email, hashed_password=hash_password(password))
    session.add(user); session.commit(); session.refresh(user)
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email}}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email}}
