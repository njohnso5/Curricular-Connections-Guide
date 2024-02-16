from marshmallow import Schema, fields
from schemas import ThemeSchema

class SearchProgramSchema(Schema):
    themes = fields.List(fields.Str())
    departments = fields.List(fields.Str())
    title = fields.Str()
    dates = fields.List(fields.Str())
    searchByRange = fields.Bool(required=True)
    
    
class SearchCourseSchema(Schema):
    themes = fields.List(fields.Int())
    title = fields.Str()
    
    