import uuid
from datetime import datetime
from decimal import Decimal
from app import db

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    data_hora = db.Column(db.DateTime, nullable=False)
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    numero_carteira = db.Column(db.String(50))
    valor_total = db.Column(db.Numeric(10, 2), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    procedures = db.relationship('Procedure', secondary='appointment_procedures', backref='appointments')

class AppointmentProcedure(db.Model):
    __tablename__ = 'appointment_procedures'
    
    appointment_id = db.Column(db.String(36), db.ForeignKey('appointments.id'), primary_key=True)
    procedure_id = db.Column(db.String(36), db.ForeignKey('procedures.id'), primary_key=True)