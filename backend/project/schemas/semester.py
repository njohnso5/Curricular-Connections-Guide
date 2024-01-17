from marshmallow import Schema, fields
from schemas import CourseSchema, PeriodSchema
from Data_model.models import db

class SemesterPostSchema(Schema):
    id = fields.Int(dump_only=True)
    year = fields.Int(required=True)
    active = fields.Bool(required=True, default=False)
    period_id = fields.Int(required=True)
    courses = fields.List(fields.Nested(CourseSchema(), dump_only=True))

class SemesterSchema(Schema):
    id = fields.Int()
    year = fields.Int()
    active = fields.Bool()
    period = fields.Nested(PeriodSchema())

class SemesterUpdateSchema(Schema):
    active = fields.Bool()
