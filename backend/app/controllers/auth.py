from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app.models.patient import Patient
from app.utils.auth import check_password, hash_password, valid_password, get_current_user
from app.schemas.user_schema import UserSchema
from app.schemas.patient_schema import PatientSchema
from app import db

auth_bp = Blueprint('auth', __name__)

# Initialize schemas
user_schema = UserSchema()
patient_schema = PatientSchema()

@auth_bp.route('/login', methods=['POST'])
def login():
    """Public login endpoint"""
    data = request.get_json(silent=True)
    
    if not isinstance(data, dict) or not isinstance(data.get('email'), str) or not isinstance(data.get('senha'), str) or not data['email'] or not data['senha']:
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    # Try to find user first
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password(data['senha'], user.senha):
        access_token = create_access_token(identity=str(user.id), additional_claims={'account_type': 'user'})
        return jsonify({
            'access_token': access_token,
            'user': user_schema.dump(user),
            'role': user.tipo
        }), 200
        
    # If not user, try patient
    patient = Patient.query.filter_by(email=data['email']).first()
    
    if patient and check_password(data['senha'], patient.senha):
        access_token = create_access_token(identity=str(patient.id), additional_claims={'account_type': 'patient'})
        return jsonify({
            'access_token': access_token,
            'user': patient_schema.dump(patient),
            'role': 'patient',
            'first_access': patient.first_access
        }), 200
    
    return jsonify({'error': 'Credenciais inválidas'}), 401

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change password for current user/patient"""
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not valid_password(data.get('new_password')):
        return jsonify({'error': 'Nova senha deve ter pelo menos 6 caracteres e no máximo 72 bytes'}), 400
    account = get_current_user()
    if account is None:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    if 'current_password' in data and not check_password(data['current_password'], account.senha):
        return jsonify({'error': 'Senha atual incorreta'}), 400
    account.senha = hash_password(data['new_password'])
    if isinstance(account, Patient):
        account.first_access = False
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Erro ao alterar senha'}), 500
    return jsonify({'message': 'Senha alterada com sucesso'}), 200
