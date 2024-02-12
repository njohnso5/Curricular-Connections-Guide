from marshmallow import Schema, fields
from schemas import ThemeSchema, FacultySchema

class SubjectSchema(Schema):
    id = fields.Int()
    subject = fields.Str()
    
class CoursePostSchema(Schema):
    id = fields.Int(dump_only=True)
    title_short = fields.Str(required=True)
    title_long = fields.Str(required=True)
    description = fields.Str(required=True)
    subject_id = fields.Int(required=True)
    catalog_number = fields.Str(required=True)
    semester_id = fields.Int(required=True)
    faculty = fields.List(fields.Nested(FacultySchema()), required=False)
    topics_description = fields.Str(required=False)
    topics_description_s = fields.Str(required=False)
    topics_description_f = fields.Str(required=False)


class CourseSchema(Schema):
    id = fields.Int()
    title_short = fields.Str()
    title_long = fields.Str()
    description = fields.Str()
    subject = fields.Nested(SubjectSchema())
    subject_id = fields.Int()
    catalog_number = fields.Str()
    semester_id = fields.Int()
    topics_description = fields.Str(required=False)
    topics_description_s = fields.Str(required=False)
    topics_description_f = fields.Str(required=False)
    themes = fields.List(fields.Nested(ThemeSchema()))
    faculty = fields.List(fields.Nested(FacultySchema()))
    
  