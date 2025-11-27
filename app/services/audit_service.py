import json
from flask import request
from app import db
from app.models.audit_log import AuditLog

class AuditService:
    @staticmethod
    def log_action(user_id, action, table_name=None, record_id=None, old_values=None, new_values=None, details=None):
        try:
            # Get IP address from request if available
            ip_address = None
            if request:
                if request.headers.getlist("X-Forwarded-For"):
                    ip_address = request.headers.getlist("X-Forwarded-For")[0]
                else:
                    ip_address = request.remote_addr

            # Serialize values to JSON if they are dicts
            if isinstance(old_values, dict):
                old_values = json.dumps(old_values, default=str)
            if isinstance(new_values, dict):
                new_values = json.dumps(new_values, default=str)

            log = AuditLog(
                user_id=user_id,
                action=action,
                table_name=table_name,
                record_id=record_id,
                old_values=old_values,
                new_values=new_values,
                ip_address=ip_address,
                details=details
            )
            
            db.session.add(log)
            db.session.commit()
            return log
        except Exception as e:
            print(f"Error creating audit log: {e}")
            db.session.rollback()
            return None
