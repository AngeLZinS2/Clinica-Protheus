from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.procedure import Procedure
from app.services.procedure_service import ProcedureService
from app.utils.auth import admin_required
from app.utils.pagination import paginate_query

procedures_bp = Blueprint('procedures', __name__)

@procedures_bp.route('', methods=['POST'])
@admin_required
def create_procedure():
    """Create new procedure (admin only)"""
    data = request.get_json()
    
    required_fields = ['nome', 'valor_plano', 'valor_particular']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Nome, valor_plano e valor_particular são obrigatórios'}), 400
    
    procedure, error = ProcedureService.create_procedure(data)
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(procedure.to_dict()), 201

@procedures_bp.route('', methods=['GET'])
@jwt_required()
def list_procedures():
    """List all procedures with pagination"""
    query = Procedure.query.order_by(Procedure.nome)
    result = paginate_query(query)
    return jsonify(result), 200

@procedures_bp.route('/<procedure_id>', methods=['GET'])
@jwt_required()
def get_procedure(procedure_id):
    """Get procedure by ID"""
    procedure = Procedure.query.get(procedure_id)
    if not procedure:
        return jsonify({'error': 'Procedimento não encontrado'}), 404
    
    return jsonify(procedure.to_dict()), 200

@procedures_bp.route('/<procedure_id>', methods=['PUT'])
@admin_required
def update_procedure(procedure_id):
    """Update procedure (admin only)"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados são obrigatórios'}), 400
    
    procedure, error = ProcedureService.update_procedure(procedure_id, data)
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(procedure.to_dict()), 200

@procedures_bp.route('/<procedure_id>', methods=['DELETE'])
@admin_required
def delete_procedure(procedure_id):
    """Delete procedure (admin only)"""
    success, error = ProcedureService.delete_procedure(procedure_id)
    if not success:
        return jsonify({'error': error}), 400
    
    return jsonify({'message': 'Procedimento removido com sucesso'}), 200