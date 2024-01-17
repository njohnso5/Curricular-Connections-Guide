from marshmallow import Schema, fields

class ThemeSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    
class ThemeSearchSchema(Schema):
    theme_ids = fields.List(fields.Int())