from marshmallow import Schema, fields

class ThemeSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    
class ThemeSearchSchema(Schema):
    theme_ids = fields.List(fields.Int())

class ThemePostSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)