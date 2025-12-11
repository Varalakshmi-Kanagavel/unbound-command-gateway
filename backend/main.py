from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from . import models, schemas, auth, rules_engine, executor
from .seed import seed
import os

# Import the response model that includes api_key
from .schemas import UserCreateResponse

app = FastAPI(title="Unbound Command Gateway")

# create tables on startup (dev friendly)
Base.metadata.create_all(bind=engine)

# Seed admin & rules if not present
seed(os.getenv("ADMIN_API_KEY"))


@app.post("/users", response_model=UserCreateResponse)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.admin_required),
):
    """
    Admin-only endpoint to create a new user.
    Returns the user's api_key ONE TIME in the response.
    """
    import uuid

    api_key = str(uuid.uuid4())
    user = models.User(
        name=user_in.name, api_key=api_key, role=user_in.role, credits=user_in.credits
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Return the api_key only once (on creation)
    return {
        "id": user.id,
        "name": user.name,
        "role": user.role,
        "credits": user.credits,
        "api_key": user.api_key,
    }


@app.get("/credits")
def get_credits(current_user: models.User = Depends(auth.get_current_user)):
    return {"credits": current_user.credits}


@app.post("/rules", response_model=schemas.RuleOut)
def add_rule(
    rule_in: schemas.RuleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.admin_required),
):
    # validate regex
    if not rules_engine.validate_regex(rule_in.pattern):
        raise HTTPException(status_code=400, detail="Invalid regex pattern")
    r = models.Rule(
        pattern=rule_in.pattern, action=rule_in.action, created_by=current_user.id
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@app.get("/rules")
def list_rules(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    rs = db.query(models.Rule).all()
    return rs


@app.post("/commands", response_model=schemas.CommandOut)
def submit_command(cmd_in: schemas.CommandCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # check credits
    if current_user.credits <= 0:
        # record audit
        db.add(models.Audit(actor_id=current_user.id, action="command_rejected", details="insufficient credits"))
        db.commit()
        raise HTTPException(status_code=402, detail="Insufficient credits")

    # match rules
    rule = rules_engine.match_first_rule(cmd_in.command_text, db)
    if rule:
        if rule.action == models.RuleAction.AUTO_REJECT:
            # log and return rejected
            cmd = models.Command(user_id=current_user.id, command_text=cmd_in.command_text, status="rejected", result=f"Rejected by rule {rule.pattern}")
            db.add(cmd)
            db.add(models.Audit(actor_id=current_user.id, action="command_rejected", details=rule.pattern))
            db.commit()
            db.refresh(cmd)
            raise HTTPException(status_code=400, detail="Command rejected by policy")
        # if AUTO_ACCEPT fall through to execution

    # Execute (transactional inside)
    cmd = executor.execute_command(db, current_user, cmd_in.command_text)
    return cmd


@app.get("/commands")
def get_history(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    cmds = db.query(models.Command).filter(models.Command.user_id == current_user.id).order_by(models.Command.created_at.desc()).all()
    return cmds


@app.get("/audit")
def get_audit(db: Session = Depends(get_db), current_user: models.User = Depends(auth.admin_required)):
    logs = db.query(models.Audit).order_by(models.Audit.timestamp.desc()).limit(200).all()
    return logs
