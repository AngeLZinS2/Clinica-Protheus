from marshmallow import Schema, fields, validate

class ResponsibleSchema(Schema):
    """Schema for Responsible serialization"""
    id = fields.String(dump_only=True)
    nome = fields.String(required=True, validate=validate.Length(min=1, max=100))
    cpf = fields.String(required=True, validate=validate.Length(equal=11))
    data_nascimento = fields.Date(required=True)
    email = fields.Email(required=True)
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
    email = fields.Email(required=True)
    telefone = fields.String(required=True, validate=validate.Length(min=10, max=15))
    data_nascimento = fields.Date(required=True)
    endereco = fields.Nested(AddressSchema, dump_only=True)
    responsible = fields.Nested(ResponsibleSchema, dump_only=True, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class PatientCreateSchema(Schema):
    """Schema for creating a new patient"""
    cpf = fields.String(required=True, validate=validate.Length(equal=11))
    nome = fields.String(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True)
    senha = fields.String(required=True, validate=validate.Length(min=6), load_only=True)
    telefone = fields.String(required=True, validate=validate.Length(min=10, max=15))
    data_nascimento = fields.Date(required=True)
    # Address fields
    estado = fields.String(required=True, validate=validate.Length(equal=2))
    cidade = fields.String(required=True, validate=validate.Length(min=1, max=100))
    bairro = fields.String(required=True, validate=validate.Length(min=1, max=100))
    cep = fields.String(required=True, validate=validate.Length(equal=8))
    rua = fields.String(required=True, validate=validate.Length(min=1, max=200))
    numero = fields.String(required=True, validate=validate.Length(min=1, max=10))
    # Responsible (optional)
    responsible = fields.Nested(ResponsibleSchema, allow_none=True)

class PatientUpdateSchema(Schema):
    """Schema for updating patient data"""
    nome = fields.String(validate=validate.Length(min=1, max=100))
    email = fields.Email()
    senha = fields.String(validate=validate.Length(min=6), load_only=True)
    senha_atual = fields.String(load_only=True)
    telefone = fields.String(validate=validate.Length(min=10, max=15))
    # Address fields
    estado = fields.String(validate=validate.Length(equal=2))
    cidade = fields.String(validate=validate.Length(min=1, max=100))
    bairro = fields.String(validate=validate.Length(min=1, max=100))
    cep = fields.String(validate=validate.Length(equal=8))
    rua = fields.String(validate=validate.Length(min=1, max=200))
    numero = fields.String(validate=validate.Length(min=1, max=10))
