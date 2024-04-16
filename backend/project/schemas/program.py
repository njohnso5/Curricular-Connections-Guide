from marshmallow import Schema, fields
from schemas import ThemeSchema, SemesterSchema

class ShowingSchema(Schema):
    id = fields.Int()
    datetime = fields.Str()
    location = fields.Str()
    price = fields.Str()
    program_id = fields.Int()

class ShowingPostSchema(Schema):
    id = fields.Int()
    datetime = fields.Str(required=True)
    location = fields.Str(required=True)
    datetime = fields.Str(required=True)
    price = fields.Str(required=True)

class ShowingPutSchema(Schema):
    id = fields.Int()
    datetime = fields.Str(required=True)
    location = fields.Str(required=True)
    price = fields.Str(required=True)
    state = fields.Str()

class DepartmentListSchema(Schema):
    departments = fields.List(fields.Str())

class ProgramSchema(Schema):
    id = fields.Int(dump_only=True)
    department = fields.Str()
    link = fields.Str()
    title = fields.Str()
    description = fields.Str()
    image_filename = fields.Str()
    themes = fields.List(fields.Nested(ThemeSchema()))
    showings = fields.List(fields.Nested(ShowingSchema()))
    semester = fields.Nested(SemesterSchema())

class ProgramPostSchema(Schema):
    id = fields.Int()
    title = fields.Str(required=True)
    department = fields.Str(required=True)
    description = fields.Str(required=True)
    link = fields.Str(required=False)
    showings = fields.Str()
    semester_id = fields.Int(required=True)


class ProgramPutSchema(Schema):
    id = fields.Int()
    department = fields.Str(required=True)
    link = fields.Str(required=False)
    title = fields.Str(required=True)
    description = fields.Str(required=True)
    showings = fields.List(fields.Nested(ShowingPutSchema()), required=True)
    semester_id = fields.Int(required=True)
