from marshmallow import Schema, fields
from schemas import ThemeSchema, FacultySchema

class SubjectSchema(Schema):
    id = fields.Int()
    subject = fields.Str()

# Define the schema for the CoursePostSchema
# This schema will be used to validate the data that is sent to the server when creating a new course
# The data that is sent to the server must contain the following fields:
# Required means that the field must be present in the data
# If the field is not present or invalid, the server will return a 422 status code
class CoursePostSchema(Schema):
    id = fields.Int(dump_only=True)
    title_short = fields.Str(required=True)
    title_long = fields.Str(required=True)
    description = fields.Str(required=True)
    subject = fields.Str(required=True)
    catalog_number = fields.Int(required=True)
    faculty = fields.Str(required=True)
    emails = fields.Str(required=True)
    semester_id = fields.Int(required=True)
    


class CourseSchema(Schema):
    id = fields.Int()
    title_short = fields.Str()
    title_long = fields.Str()
    description = fields.Str()
    subject = fields.Nested(SubjectSchema())
    subject_id = fields.Int()
    catalog_number = fields.Str()
    semester_id = fields.Int()
    themes = fields.List(fields.Nested(ThemeSchema()))
    faculty = fields.List(fields.Nested(FacultySchema()))
  