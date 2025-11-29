import bcrypt
from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    """Check if password matches the hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.tipo != 'admin':
            return jsonify({'error': 'Acesso negado. Apenas administradores.'}), 403
            
        return f(*args, **kwargs)
    return decorated_function

from app.models.patient import Patient

def get_current_user():
    """Get current user from JWT token"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
        return user
    return Patient.query.get(user_id)