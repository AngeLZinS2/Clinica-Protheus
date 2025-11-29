from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from app.models.procedure import Procedure
from app.services.procedure_service import ProcedureService
from app.utils.auth import admin_required
from app.utils.pagination import paginate_query
from app.schemas.procedure_schema import ProcedureSchema, ProcedureCreateSchema, ProcedureUpdateSchema

procedures_bp = Blueprint('procedures', __name__)

# Initialize schemas
procedure_schema = ProcedureSchema()
procedure_create_schema = ProcedureCreateSchema()
procedure_update_schema = ProcedureUpdateSchema()

@procedures_bp.route('', methods=['POST'])
@admin_required
def create_procedure():
    """Create new procedure (admin only)"""
    try:
        data = procedure_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    procedure, error = ProcedureService.create_procedure(data)
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(procedure_schema.dump(procedure)), 201

@procedures_bp.route('', methods=['GET'])
@jwt_required()
def list_procedures():
    """List all procedures with pagination"""
    query = Procedure.query.order_by(Procedure.nome)
    result = paginate_query(query, schema=procedure_schema)
    return jsonify(result), 200

@procedures_bp.route('/<procedure_id>', methods=['GET'])
@jwt_required()
def get_procedure(procedure_id):
    """Get procedure by ID"""
    procedure = Procedure.query.get(procedure_id)
    if not procedure:
        return jsonify({'error': 'Procedimento não encontrado'}), 404
    
    return jsonify(procedure_schema.dump(procedure)), 200

@procedures_bp.route('/<procedure_id>', methods=['PUT'])
@admin_required
def update_procedure(procedure_id):
    """Update procedure (admin only)"""
    try:
        data = procedure_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    procedure, error = ProcedureService.update_procedure(procedure_id, data)
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(procedure_schema.dump(procedure)), 200

@procedures_bp.route('/<procedure_id>', methods=['DELETE'])
@admin_required
def delete_procedure(procedure_id):
    """Delete procedure (admin only)"""
    success, error = ProcedureService.delete_procedure(procedure_id)
    if not success:
        return jsonify({'error': error}), 400
    
    return jsonify({'message': 'Procedimento removido com sucesso'}), 200