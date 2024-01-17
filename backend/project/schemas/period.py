from marshmallow import Schema, fields
from Data_model.models import PeriodEnum

class PeriodSchema(Schema):
    id = fields.Int()
    period = fields.Enum(PeriodEnum)