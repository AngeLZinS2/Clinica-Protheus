from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.audit_log import AuditLog
from app.utils.auth import get_current_user, admin_required
from app.utils.pagination import paginate_query
from datetime import datetime

audit_bp = Blueprint('audit', __name__)

@audit_bp.route('', methods=['GET'])
@jwt_required()
@admin_required
def list_logs():
    """List audit logs with filters"""
    query = AuditLog.query.order_by(AuditLog.created_at.desc())
    
    # Filters
    action = request.args.get('action')
    table_name = request.args.get('table_name')
    user_id = request.args.get('user_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if action:
        query = query.filter(AuditLog.action == action)
    
    if table_name:
        query = query.filter(AuditLog.table_name == table_name)
        
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
        
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(AuditLog.created_at >= start_dt)
        except ValueError:
            pass
            
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(AuditLog.created_at <= end_dt)
        except ValueError:
            pass
            
    result = paginate_query(query)
    return jsonify(result), 200
