from sqlalchemy.orm import Session
from . import models
import traceback

# Mock execution: do not run actual shell commands
def mock_execute(command_text: str) -> str:
    # A mocked result string — in real life, you'd run sandboxed command
    return f"[MOCK] Would execute: {command_text}"


def execute_command(db: Session, user: models.User, command_text: str):
    # Transactional: all-or-nothing
    try:
        # Create a Command record with status 'submitted'
        cmd = models.Command(user_id=user.id, command_text=command_text, status="submitted")
        db.add(cmd)
        db.flush()  # ensure cmd.id is available

        # Deduct credits only on successful execution
        if user.credits <= 0:
            cmd.status = "rejected"
            cmd.result = "Insufficient credits"
            db.add(models.Audit(actor_id=user.id, action="command_rejected", details=cmd.result))
            db.commit()
            return cmd

        # Mock execute
        result_text = mock_execute(command_text)

        # Deduct a fixed credit cost, e.g., 1 credit per command
        user.credits -= 1
        cmd.status = "executed"
        cmd.result = result_text

        # Audit
        audit = models.Audit(actor_id=user.id, action="command_executed", details=f"{command_text} -> {result_text}")
        db.add(audit)

        db.commit()
        db.refresh(cmd)
        return cmd
    except Exception as e:
        db.rollback()
        # Log and re-raise
        traceback.print_exc()
        raise
