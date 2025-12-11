import re
from typing import Optional
from sqlalchemy.orm import Session
from . import models

def validate_regex(pattern: str) -> bool:
    try:
        re.compile(pattern)
        return True
    except re.error:
        return False

def match_first_rule(command_text: str, db: Session) -> Optional[models.Rule]:
    rules = db.query(models.Rule).all()
    for r in rules:
        try:
            if re.search(r.pattern, command_text):
                return r
        except re.error:
            # skip invalid pattern (should not happen if validated on insert)
            continue
    return None
