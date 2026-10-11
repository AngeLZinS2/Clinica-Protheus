from marshmallow import Schema, fields, validate, pre_load, ValidationError
from .patient_schema import PatientSchema
from .procedure_schema import ProcedureSchema

class AppointmentSchema(Schema):
    """Schema for Appointment serialization"""
    id = fields.String(dump_only=True)
    data_hora = fields.DateTime(required=True)
    patient_id = fields.String(required=True)
    patient = fields.Nested(PatientSchema, dump_only=True, allow_none=True)
    user_id = fields.String(required=True)
    user_nome = fields.String(attribute="user.nome", dump_only=True)
    tipo = fields.String(required=True, validate=validate.OneOf(['plano', 'particular']))
    numero_carteira = fields.String(allow_none=True)
    valor_total = fields.Decimal(required=True, as_string=False, places=2)
    procedures = fields.List(fields.Nested(ProcedureSchema), dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class AppointmentCreateSchema(Schema):
    data_hora = fields.DateTime(required=True)
    patient_id = fields.String(required=True, validate=validate.Length(min=1, max=36))
    user_id = fields.String(load_only=True, validate=validate.Length(max=36))
    tipo = fields.String(required=True, validate=validate.OneOf(['plano', 'particular']))
    numero_carteira = fields.String(allow_none=True, validate=validate.Length(max=50))
    procedures = fields.List(fields.String(validate=validate.Length(min=1, max=36)), required=True, validate=validate.Length(min=1))

    @pre_load
    def normalize_procedures(self, data, **kwargs):
        if not isinstance(data, dict):
            return data
        data = dict(data)
        if 'procedure_ids' in data:
            if 'procedures' in data and data['procedures'] != data['procedure_ids']:
                raise ValidationError('Informe apenas uma lista de procedimentos')
            data['procedures'] = data.pop('procedure_ids')
        return data


class AppointmentUpdateSchema(AppointmentCreateSchema):
    def __init__(self, *args, **kwargs):
        kwargs['partial'] = True
        super().__init__(*args, **kwargs)
