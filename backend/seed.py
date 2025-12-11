import uuid
from sqlalchemy.orm import Session
from . import models
from .database import engine, SessionLocal, Base
import os

# default rules to seed
DEFAULT_RULES = [
    (r":\(\){ :\|:& };\:", models.RuleAction.AUTO_REJECT),
    (r"rm\s+-rf\s+/", models.RuleAction.AUTO_REJECT),
    (r"mkfs\.", models.RuleAction.AUTO_REJECT),
    (r"git\s+(status|log|diff)", models.RuleAction.AUTO_ACCEPT),
    (r"^(ls|cat|pwd|echo)", models.RuleAction.AUTO_ACCEPT),
]


def seed(admin_api_key: str = None):
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        admin_key = admin_api_key or os.getenv("ADMIN_API_KEY") or str(uuid.uuid4())
        admin = db.query(models.User).filter(models.User.api_key == admin_key).first()
        if not admin:
            admin = models.User(name="admin", api_key=admin_key, role=models.Role.admin, credits=9999)
            db.add(admin)
            db.commit()
            print("Created admin with api_key:", admin_key)

        # seed rules if none exist
        rules_count = db.query(models.Rule).count()
        if rules_count == 0:
            for pattern, action in DEFAULT_RULES:
                r = models.Rule(pattern=pattern, action=action, created_by=admin.id)
                db.add(r)
            db.commit()
            print("Seeded default rules")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
