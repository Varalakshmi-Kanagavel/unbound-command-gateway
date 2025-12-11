from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from . import models
from .database import get_db
from typing import Optional

API_KEY_HEADER = "x-api-key"

def get_current_user(x_api_key: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key missing")
    user = db.query(models.User).filter(models.User.api_key == x_api_key).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return user

def admin_required(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.Role.admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user
