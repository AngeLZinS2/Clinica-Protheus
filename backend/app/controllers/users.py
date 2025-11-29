from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from app.models.user import User
from app.services.user_service import UserService
from app.utils.auth import admin_required, get_current_user
from app.utils.pagination import paginate_query
from app.schemas.user_schema import UserSchema, UserCreateSchema, UserUpdateSchema

users_bp = Blueprint('users', __name__)

# Initialize schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_create_schema = UserCreateSchema()
user_update_schema = UserUpdateSchema()

@users_bp.route('', methods=['POST'])
@admin_required
def create_user():
    """Create new user (admin only)"""
    try:
        data = user_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    user, error = UserService.create_user(data)
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(user_schema.dump(user)), 201

@users_bp.route('', methods=['GET'])
@admin_required
def list_users():
    """List all users with pagination (admin only)"""
    query = User.query.order_by(User.created_at.desc())
    result = paginate_query(query, schema=user_schema)
    return jsonify(result), 200

@users_bp.route('/search', methods=['GET'])
@jwt_required()
def search_user():
    """Search user by email"""
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email é obrigatório'}), 400
    
    current_user = get_current_user()
    
    # Check permissions: Admin can search anyone, User can only search themselves
    if current_user.tipo != 'admin' and current_user.email != email:
        return jsonify({'error': 'Sem permissão para buscar este usuário'}), 403
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    return jsonify(user_schema.dump(user)), 200

@users_bp.route('/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user data"""
    try:
        data = user_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    current_user = get_current_user()
    user, error = UserService.update_user(user_id, data, current_user)
    
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(user_schema.dump(user)), 200

@users_bp.route('/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete user (admin only)"""
    current_user = get_current_user()
    success, error = UserService.delete_user(user_id, current_user)
    
    if not success:
        return jsonify({'error': error}), 400
    
    return jsonify({'message': 'Usuário removido com sucesso'}), 200

@users_bp.route('/<user_id>/reset-password', methods=['POST'])
@admin_required
def reset_password(user_id):
    """Reset user password (admin only)"""
    data = request.get_json()
    if not data or not data.get('nova_senha'):
        return jsonify({'error': 'Nova senha é obrigatória'}), 400
    
    current_user = get_current_user()
    user, error = UserService.reset_password(user_id, data['nova_senha'], current_user)
    
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify({'message': 'Senha resetada com sucesso'}), 200