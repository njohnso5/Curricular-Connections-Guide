from marshmallow import Schema, fields

class AdminLogSchema(Schema):
    id = fields.Int(dump_only=True)
    unity_id = fields.Str(required=True)
    call = fields.Str(required=True)
    datetime = fields.Str(required=True)

class UserLogSchema(Schema):
    id = fields.Int(dump_only=True)
    querySearch = fields.Str(required=True)
    datetime = fields.Str(required=True)