from flask import Blueprint, request, jsonify
from app import db
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from app.models.patient import Patient
from app.models.user import User
from app.utils.auth import get_current_user
from app.services.patient_service import PatientService
from app.utils.pagination import paginate_query
from app.schemas.patient_schema import PatientSchema, PatientCreateSchema, PatientUpdateSchema

patients_bp = Blueprint('patients', __name__)

# Initialize schemas
patient_schema = PatientSchema()
patient_create_schema = PatientCreateSchema()
patient_update_schema = PatientUpdateSchema()

@patients_bp.route('', methods=['POST'])
@jwt_required()
def create_patient():
    if not isinstance(get_current_user(), User):
        return jsonify({'error': 'Acesso negado'}), 403
    """Create new patient"""
    try:
        data = patient_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    patient, error = PatientService.create_patient(data)
    if error:
        db.session.rollback()
        return jsonify({'error': error}), 400
    
    return jsonify(patient_schema.dump(patient)), 201

@patients_bp.route('', methods=['GET'])
@jwt_required()
def list_patients():
    if not isinstance(get_current_user(), User):
        return jsonify({'error': 'Acesso negado'}), 403
    """List all patients with pagination"""
    query = Patient.query.order_by(Patient.created_at.desc())
    result = paginate_query(query, schema=patient_schema)
    return jsonify(result), 200

@patients_bp.route('/<patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    actor = get_current_user()
    if actor is None or (isinstance(actor, Patient) and actor.id != patient_id):
        return jsonify({'error': 'Acesso negado'}), 403
    """Get patient by ID"""
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Paciente não encontrado'}), 404
    
    return jsonify(patient_schema.dump(patient)), 200

@patients_bp.route('/<patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    actor = get_current_user()
    if actor is None or (isinstance(actor, Patient) and actor.id != patient_id):
        return jsonify({'error': 'Acesso negado'}), 403
    """Update patient data"""
    try:
        data = patient_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    patient, error = PatientService.update_patient(patient_id, data)
    if error:
        db.session.rollback()
        return jsonify({'error': error}), 400
    
    return jsonify(patient_schema.dump(patient)), 200

@patients_bp.route('/<patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    if not isinstance(get_current_user(), User):
        return jsonify({'error': 'Acesso negado'}), 403
    """Delete patient"""
    success, error = PatientService.delete_patient(patient_id)
    if not success:
        return jsonify({'error': error}), 400
    
    return jsonify({'message': 'Paciente removido com sucesso'}), 200