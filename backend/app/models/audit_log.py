import uuid
from datetime import datetime
from app import db

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True) # Nullable because system actions might not have a user
    action = db.Column(db.String(50), nullable=False) # CREATE, UPDATE, DELETE, LOGIN, etc.
    table_name = db.Column(db.String(50), nullable=True)
    record_id = db.Column(db.String(36), nullable=True)
    old_values = db.Column(db.Text, nullable=True) # JSON string
    new_values = db.Column(db.Text, nullable=True) # JSON string
    ip_address = db.Column(db.String(45), nullable=True)
    details = db.Column(db.String(255), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref='audit_logs')
