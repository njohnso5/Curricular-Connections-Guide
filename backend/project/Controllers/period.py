from flask_smorest import Blueprint
from flask.views import MethodView
from schemas import PeriodSchema
from Data_model.models import Period

period_controller = Blueprint('period_api', __name__, url_prefix='/periods')

@period_controller.route('/')
class PeriodList(MethodView):

    @period_controller.response(200, PeriodSchema(many=True))
    def get(self):
        return Period.query.all()