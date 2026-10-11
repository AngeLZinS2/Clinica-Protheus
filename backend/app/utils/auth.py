import bcrypt
from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User
from app.models.patient import Patient


def valid_password(password):
    if not isinstance(password, str) or len(password) < 6:
        return False
    try:
        return len(password.encode('utf-8')) <= 72
    except UnicodeError:
        return False


def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password, hashed):
    if not isinstance(password, str) or not isinstance(hashed, str):
        return False
    try:
        if len(password.encode('utf-8')) > 72:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except (ValueError, TypeError, UnicodeError):
        return False


def get_current_user():
    """Resolve namespaces explicitly; retain only unambiguous legacy sessions."""
    account_id = get_jwt_identity()
    account_type = get_jwt().get('account_type')
    if account_type == 'user':
        return db.session.get(User, account_id)
    if account_type == 'patient':
        return db.session.get(Patient, account_id)
    if account_type is not None:
        return None
    user = db.session.get(User, account_id)
    patient = db.session.get(Patient, account_id)
    if user is not None and patient is not None:
        return None
    return user if user is not None else patient


def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not isinstance(user, User) or user.tipo != 'admin':
            return jsonify({'error': 'Acesso negado. Apenas administradores.'}), 403
        return f(*args, **kwargs)
    return decorated_function
