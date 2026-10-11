from marshmallow import Schema, fields, validate, pre_load, ValidationError

class ResponsibleSchema(Schema):
    """Schema for Responsible serialization"""
    id = fields.String(dump_only=True)
    nome = fields.String(required=True, validate=validate.Length(min=1, max=100))
    cpf = fields.String(required=True, validate=validate.Length(equal=11))
    data_nascimento = fields.Date(required=True)
    email = fields.Email(required=True, validate=validate.Length(max=120))
    telefone = fields.String(required=True, validate=validate.Length(min=10, max=15))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class AddressSchema(Schema):
    """Schema for nested address data"""
    estado = fields.String(required=True, validate=validate.Length(equal=2))
    cidade = fields.String(required=True, validate=validate.Length(min=1, max=100))
    bairro = fields.String(required=True, validate=validate.Length(min=1, max=100))
    cep = fields.String(required=True, validate=validate.Length(equal=8))
    rua = fields.String(required=True, validate=validate.Length(min=1, max=200))
    numero = fields.String(required=True, validate=validate.Length(min=1, max=10))

class PatientSchema(Schema):
    """Schema for Patient serialization"""
    id = fields.String(dump_only=True)
    cpf = fields.String(required=True, validate=validate.Length(equal=11))
    nome = fields.String(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True, validate=validate.Length(max=120))
    telefone = fields.String(required=True, validate=validate.Length(min=10, max=15))
    data_nascimento = fields.Date(required=True)
    estado = fields.String(dump_only=True)
    cidade = fields.String(dump_only=True)
    bairro = fields.String(dump_only=True)
    cep = fields.String(dump_only=True)
    rua = fields.String(dump_only=True)
    numero = fields.String(dump_only=True)
    endereco = fields.Method('get_address')

    def get_address(self, obj):
        return {key: getattr(obj, key) for key in ('estado', 'cidade', 'bairro', 'cep', 'rua', 'numero')}
    responsible = fields.Nested(ResponsibleSchema, dump_only=True, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class PatientCreateSchema(Schema):
    cpf = fields.String(required=True, validate=validate.Length(equal=11))
    nome = fields.String(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True, validate=validate.Length(max=120))
    telefone = fields.String(required=True, validate=validate.Length(min=10, max=15))
    data_nascimento = fields.Date(required=True)
    endereco = fields.Nested(AddressSchema, required=True)
    responsible = fields.Nested(ResponsibleSchema, allow_none=True)

    @pre_load
    def normalize_address(self, data, **kwargs):
        if not isinstance(data, dict):
            return data
        data = dict(data)
        keys = ('estado', 'cidade', 'bairro', 'cep', 'rua', 'numero')
        flat = {key: data.pop(key) for key in keys if key in data}
        if flat:
            if 'endereco' in data:
                raise ValidationError('Informe endereço em um único formato')
            data['endereco'] = flat
        return data


class PatientUpdateSchema(PatientCreateSchema):
    def __init__(self, *args, **kwargs):
        kwargs['partial'] = True
        super().__init__(*args, **kwargs)
