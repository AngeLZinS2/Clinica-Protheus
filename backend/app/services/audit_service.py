import json
from flask import request, has_request_context, current_app
from ipaddress import ip_address as parse_ip
from app import db
from app.models.audit_log import AuditLog

class AuditService:
    @staticmethod
    def log_action(user_id, action, table_name=None, record_id=None, old_values=None, new_values=None, details=None):
        try:
            # Get IP address from request if available
            ip_address = None
            if has_request_context() and request.remote_addr:
                try:
                    ip_address = str(parse_ip(request.remote_addr))
                except ValueError:
                    pass

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
            current_app.logger.error("Audit log persistence failed (%s)", type(e).__name__)
            db.session.rollback()
            return None
