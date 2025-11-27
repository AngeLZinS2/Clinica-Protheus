from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app.utils.auth import check_password, hash_password
from app import db

auth_bp = Blueprint('auth', __name__)

from app.models.patient import Patient

@auth_bp.route('/login', methods=['POST'])
def login():
    """Public login endpoint"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('senha'):
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    # Try to find user first
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password(data['senha'], user.senha):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict(),
            'role': user.tipo
        }), 200
        
    # If not user, try patient
    patient = Patient.query.filter_by(email=data['email']).first()
    
    if patient and check_password(data['senha'], patient.senha):
        access_token = create_access_token(identity=str(patient.id))
        return jsonify({
            'access_token': access_token,
            'user': patient.to_dict(),
            'role': 'patient',
            'first_access': patient.first_access
        }), 200
    
    return jsonify({'error': 'Credenciais inválidas'}), 401

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change password for current user/patient"""
    current_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('new_password'):
        return jsonify({'error': 'Nova senha é obrigatória'}), 400
        
    # Try to find patient first (common case for this flow)
    patient = Patient.query.get(current_id)
    if patient:
        patient.senha = hash_password(data['new_password'])
        patient.first_access = False
        db.session.commit()
        return jsonify({'message': 'Senha alterada com sucesso'}), 200
        
    # Try user
    user = User.query.get(current_id)
    if user:
        user.senha = hash_password(data['new_password'])
        db.session.commit()
        return jsonify({'message': 'Senha alterada com sucesso'}), 200
        
    return jsonify({'error': 'Usuário não encontrado'}), 404