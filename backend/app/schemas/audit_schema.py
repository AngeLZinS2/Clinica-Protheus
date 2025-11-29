from marshmallow import Schema, fields

class AuditLogSchema(Schema):
    """Schema for AuditLog serialization"""
    id = fields.String(dump_only=True)
    user_id = fields.String(allow_none=True)
    user_nome = fields.String(dump_only=True)
    action = fields.String(required=True)
    table_name = fields.String(allow_none=True)
    record_id = fields.String(allow_none=True)
    old_values = fields.String(allow_none=True)
    new_values = fields.String(allow_none=True)
    ip_address = fields.String(allow_none=True)
    details = fields.String(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
