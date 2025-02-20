from marshmallow import Schema, fields
from Data_model.models import db

class FacultySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    email = fields.Str(required=True)
