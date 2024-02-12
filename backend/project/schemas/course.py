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
    faculty = fields.List(fields.Nested(FacultySchema()), required=False)
    topics_description = fields.Str(required=False)
    topics_description_s = fields.Str(required=False)
    topics_description_f = fields.Str(required=False)
    course_id = fields.Int(required=False)
    


class CourseSchema(Schema):
    id = fields.Int()
    title_short = fields.Str()
    title_long = fields.Str()
    description = fields.Str()
    subject = fields.Nested(SubjectSchema())
    catalog_number = fields.Str()
    semester_id = fields.Int()
    topics_description = fields.Str(required=False)
    topics_description_s = fields.Str(required=False)
    topics_description_f = fields.Str(required=False)
    themes = fields.List(fields.Nested(ThemeSchema()))
    faculty = fields.List(fields.Nested(FacultySchema()))
    
  