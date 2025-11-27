from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.patient import Patient
from app.services.patient_service import PatientService
from app.utils.pagination import paginate_query

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('', methods=['POST'])
@jwt_required()
def create_patient():
    """Create new patient"""
    data = request.get_json()
    
    required_fields = ['cpf', 'nome', 'email', 'telefone', 'data_nascimento', 'endereco']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
    
    patient, error = PatientService.create_patient(data)
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(patient.to_dict()), 201

@patients_bp.route('', methods=['GET'])
@jwt_required()
def list_patients():
    """List all patients with pagination"""
    query = Patient.query.order_by(Patient.created_at.desc())
    result = paginate_query(query)
    return jsonify(result), 200

@patients_bp.route('/<patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    """Get patient by ID"""
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Paciente não encontrado'}), 404
    
    return jsonify(patient.to_dict()), 200

@patients_bp.route('/<patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    """Update patient data"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados são obrigatórios'}), 400
    
    patient, error = PatientService.update_patient(patient_id, data)
    if error:
        print(f"Error updating patient: {error}")
        return jsonify({'error': error}), 400
    
    return jsonify(patient.to_dict()), 200

@patients_bp.route('/<patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    """Delete patient"""
    success, error = PatientService.delete_patient(patient_id)
    if not success:
        return jsonify({'error': error}), 400
    
    return jsonify({'message': 'Paciente removido com sucesso'}), 200