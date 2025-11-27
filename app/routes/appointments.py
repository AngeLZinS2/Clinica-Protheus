from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from app.models.appointment import Appointment
from app.services.appointment_service import AppointmentService
from app.utils.auth import get_current_user
from app.utils.pagination import paginate_query

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('', methods=['POST'])
@jwt_required()
def create_appointment():
    """Create new appointment"""
    data = request.get_json()
    
    required_fields = ['data_hora', 'patient_id', 'tipo', 'procedures']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
    
    current_user = get_current_user()
    appointment, error = AppointmentService.create_appointment(data, current_user.id)
    
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(appointment.to_dict()), 201

@appointments_bp.route('', methods=['GET'])
@jwt_required()
def list_appointments():
    """List appointments with pagination and date filters"""
    query = Appointment.query.order_by(Appointment.data_hora.desc())
    
    current_user = get_current_user()
    print(f"DEBUG: Current User: {current_user.nome}, ID: {current_user.id}, Type: {type(current_user)}")
    
    # If user is a Patient (has cpf), only show their appointments
    if hasattr(current_user, 'cpf'):
        print(f"DEBUG: User is Patient. Filtering by patient_id: {current_user.id}")
        query = query.filter(Appointment.patient_id == current_user.id)
    else:
        print("DEBUG: User is Admin/Staff. Showing all appointments.")
        
    count = query.count()
    print(f"DEBUG: Found {count} appointments")
    
    # Date filters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(Appointment.data_hora >= start_dt)
        except ValueError:
            return jsonify({'error': 'Formato de start_date inválido'}), 400
    
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(Appointment.data_hora <= end_dt)
        except ValueError:
            return jsonify({'error': 'Formato de end_date inválido'}), 400
    
    result = paginate_query(query)
    return jsonify(result), 200

@appointments_bp.route('/<appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    """Get appointment by ID"""
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({'error': 'Atendimento não encontrado'}), 404
    
    return jsonify(appointment.to_dict()), 200

@appointments_bp.route('/<appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    """Update appointment"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados são obrigatórios'}), 400
    
    current_user = get_current_user()
    appointment, error = AppointmentService.update_appointment(appointment_id, data, current_user)
    
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(appointment.to_dict()), 200

@appointments_bp.route('/<appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    """Delete appointment"""
    current_user = get_current_user()
    success, error = AppointmentService.delete_appointment(appointment_id, current_user)
    
    if not success:
        return jsonify({'error': error}), 400
    
    return jsonify({'message': 'Atendimento removido com sucesso'}), 200