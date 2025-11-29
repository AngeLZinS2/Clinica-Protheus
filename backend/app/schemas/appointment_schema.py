from marshmallow import Schema, fields, validate
from .patient_schema import PatientSchema
from .procedure_schema import ProcedureSchema

class AppointmentSchema(Schema):
    """Schema for Appointment serialization"""
    id = fields.String(dump_only=True)
    data_hora = fields.DateTime(required=True)
    patient_id = fields.String(required=True)
    patient = fields.Nested(PatientSchema, dump_only=True, allow_none=True)
    user_id = fields.String(required=True)
    user_nome = fields.String(dump_only=True)
    tipo = fields.String(required=True, validate=validate.OneOf(['plano', 'particular']))
    numero_carteira = fields.String(allow_none=True)
    valor_total = fields.Decimal(required=True, as_string=False, places=2)
    procedures = fields.List(fields.Nested(ProcedureSchema), dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class AppointmentCreateSchema(Schema):
    """Schema for creating a new appointment"""
    data_hora = fields.DateTime(required=True)
    patient_id = fields.String(required=True)
    user_id = fields.String(required=True)
    tipo = fields.String(required=True, validate=validate.OneOf(['plano', 'particular']))
    numero_carteira = fields.String(allow_none=True)
    procedure_ids = fields.List(fields.String(), required=True, validate=validate.Length(min=1))
