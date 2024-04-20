from flask_smorest import Blueprint
from flask.views import MethodView
from schemas import AdminLogSchema, UserLogSchema
import Data_model.adminlog_dao as admin_dao
import Data_model.userlog_dao as user_dao
from Data_model.permissions import require_roles
from Data_model.models import RoleEnum

log_controller = Blueprint('log_api', __name__, url_prefix='/log')

@log_controller.route('/')
class LoggingList(MethodView):
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    @log_controller.response(200, AdminLogSchema(many=True))
    def get(self):
        admin = admin_dao.get_all()
        return admin
    
@log_controller.route('/user/')
class LoggingListUser(MethodView):
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    @log_controller.response(200, UserLogSchema(many=True))
    def get(self):
        return user_dao.get_all()