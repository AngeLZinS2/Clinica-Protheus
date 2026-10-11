from decimal import Decimal
from marshmallow import Schema, fields, validate

class ProcedureSchema(Schema):
    """Schema for Procedure serialization"""
    id = fields.String(dump_only=True)
    nome = fields.String(required=True, validate=[validate.Length(min=1, max=100), validate.Regexp(r".*\S.*", error="Nome não pode ser vazio")])
    descricao = fields.String(allow_none=True)
    valor_plano = fields.Decimal(required=True, as_string=False, places=2, validate=validate.Range(min=Decimal("0"), max=Decimal("99999999.99")))
    valor_particular = fields.Decimal(required=True, as_string=False, places=2, validate=validate.Range(min=Decimal("0"), max=Decimal("99999999.99")))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class ProcedureCreateSchema(Schema):
    """Schema for creating a new procedure"""
    nome = fields.String(required=True, validate=[validate.Length(min=1, max=100), validate.Regexp(r".*\S.*", error="Nome não pode ser vazio")])
    descricao = fields.String(allow_none=True)
    valor_plano = fields.Decimal(required=True, as_string=False, places=2, validate=validate.Range(min=Decimal("0"), max=Decimal("99999999.99")))
    valor_particular = fields.Decimal(required=True, as_string=False, places=2, validate=validate.Range(min=Decimal("0"), max=Decimal("99999999.99")))

class ProcedureUpdateSchema(Schema):
    """Schema for updating procedure data"""
    nome = fields.String(validate=[validate.Length(min=1, max=100), validate.Regexp(r".*\S.*", error="Nome não pode ser vazio")])
    descricao = fields.String(allow_none=True)
    valor_plano = fields.Decimal(as_string=False, places=2, validate=validate.Range(min=Decimal("0"), max=Decimal("99999999.99")))
    valor_particular = fields.Decimal(as_string=False, places=2, validate=validate.Range(min=Decimal("0"), max=Decimal("99999999.99")))
