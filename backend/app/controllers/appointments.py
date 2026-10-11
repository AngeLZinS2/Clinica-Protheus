from flask import Blueprint, request, jsonify
from app import db
from flask_jwt_extended import jwt_required
from datetime import datetime
from marshmallow import ValidationError
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.user import User
from app.services.appointment_service import AppointmentService
from app.utils.auth import get_current_user
from app.utils.pagination import paginate_query
from app.schemas.appointment_schema import AppointmentSchema, AppointmentCreateSchema, AppointmentUpdateSchema

appointments_bp = Blueprint('appointments', __name__)

# Initialize schemas
appointment_schema = AppointmentSchema()
appointment_create_schema = AppointmentCreateSchema()
appointment_update_schema = AppointmentUpdateSchema()

@appointments_bp.route('', methods=['POST'])
@jwt_required()
def create_appointment():
    if not isinstance(get_current_user(), User):
        return jsonify({'error': 'Acesso negado'}), 403
    """Create new appointment"""
    try:
        data = appointment_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    
    current_user = get_current_user()
    appointment, error = AppointmentService.create_appointment(data, current_user.id)
    
    if error:
        db.session.rollback()
        return jsonify({'error': error}), 400
    
    return jsonify(appointment_schema.dump(appointment)), 201

@appointments_bp.route('', methods=['GET'])
@jwt_required()
def list_appointments():
    """List appointments with pagination and date filters"""
    query = Appointment.query.order_by(Appointment.data_hora.desc())
    
    current_user = get_current_user()
    if current_user is None:
        return jsonify({'error': 'Acesso negado'}), 403
    if isinstance(current_user, Patient):
        query = query.filter(Appointment.patient_id == current_user.id)

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
    
    result = paginate_query(query, schema=appointment_schema)
    return jsonify(result), 200

@appointments_bp.route('/<appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    """Get appointment by ID"""
    actor = get_current_user()
    if actor is None:
        return jsonify({'error': 'Acesso negado'}), 403
    query = Appointment.query.filter_by(id=appointment_id)
    if isinstance(actor, Patient):
        query = query.filter_by(patient_id=actor.id)
    appointment = query.first()
    if not appointment:
        return jsonify({'error': 'Atendimento não encontrado'}), 404
    
    return jsonify(appointment_schema.dump(appointment)), 200

@appointments_bp.route('/<appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    if not isinstance(get_current_user(), User):
        return jsonify({'error': 'Acesso negado'}), 403
    """Update appointment"""
    try:
        data = appointment_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400

    current_user = get_current_user()
    appointment, error = AppointmentService.update_appointment(appointment_id, data, current_user)
    
    if error:
        db.session.rollback()
        return jsonify({'error': error}), 400
    
    return jsonify(appointment_schema.dump(appointment)), 200

@appointments_bp.route('/<appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    if not isinstance(get_current_user(), User):
        return jsonify({'error': 'Acesso negado'}), 403
    """Delete appointment"""
    current_user = get_current_user()
    success, error = AppointmentService.delete_appointment(appointment_id, current_user)
    
    if not success:
        return jsonify({'error': error}), 400
    
    return jsonify({'message': 'Atendimento removido com sucesso'}), 200