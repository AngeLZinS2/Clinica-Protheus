from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    """Schema for User serialization"""
    id = fields.String(dump_only=True)
    nome = fields.String(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True)
    tipo = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class UserCreateSchema(Schema):
    """Schema for creating a new user"""
    nome = fields.String(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True)
    senha = fields.String(required=True, validate=validate.Length(min=6), load_only=True)
    tipo = fields.String(validate=validate.OneOf(['admin', 'default']), missing='default')

class UserUpdateSchema(Schema):
    """Schema for updating user data"""
    nome = fields.String(validate=validate.Length(min=1, max=100))
    email = fields.Email()
    senha = fields.String(validate=validate.Length(min=6), load_only=True)
    senha_atual = fields.String(load_only=True)
