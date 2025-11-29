from flask_marshmallow import Marshmallow

ma = Marshmallow()

from .user_schema import UserSchema, UserCreateSchema, UserUpdateSchema
from .patient_schema import PatientSchema, PatientCreateSchema, PatientUpdateSchema, ResponsibleSchema
from .appointment_schema import AppointmentSchema, AppointmentCreateSchema
from .procedure_schema import ProcedureSchema, ProcedureCreateSchema, ProcedureUpdateSchema
from .audit_schema import AuditLogSchema

__all__ = [
    'ma',
    'UserSchema',
    'UserCreateSchema',
    'UserUpdateSchema',
    'PatientSchema',
    'PatientCreateSchema',
    'PatientUpdateSchema',
    'ResponsibleSchema',
    'AppointmentSchema',
    'AppointmentCreateSchema',
    'ProcedureSchema',
    'ProcedureCreateSchema',
    'ProcedureUpdateSchema',
    'AuditLogSchema'
]
