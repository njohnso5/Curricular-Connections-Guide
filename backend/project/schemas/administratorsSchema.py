from marshmallow import Schema, fields
from Data_model.models import RoleEnum

class RoleSchema(Schema):
    id = fields.Integer(required=True)
    role = fields.Enum(RoleEnum, dump_only=True)

class AdministratorsSchema(Schema):
    id = fields.Integer(dump_only=True)
    unity_id = fields.String(required=True)
    role = fields.Nested(RoleSchema)

class AdministratorPostSchema(Schema):
    unity_id = fields.String(required=True)
    role_id = fields.Integer(required=True)

