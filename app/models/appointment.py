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
    
    def to_dict(self):
        return {
            'id': self.id,
            'data_hora': self.data_hora.isoformat(),
            'patient_id': self.patient_id,
            'patient': self.patient.to_dict() if self.patient else None,
            'user_id': self.user_id,
            'user_nome': self.user.nome,
            'tipo': self.tipo,
            'numero_carteira': self.numero_carteira,
            'valor_total': float(self.valor_total),
            'procedures': [proc.to_dict() for proc in self.procedures],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AppointmentProcedure(db.Model):
    __tablename__ = 'appointment_procedures'
    
    appointment_id = db.Column(db.String(36), db.ForeignKey('appointments.id'), primary_key=True)
    procedure_id = db.Column(db.String(36), db.ForeignKey('procedures.id'), primary_key=True)