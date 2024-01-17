from flask_smorest import Blueprint, abort
from flask.views import MethodView
import Data_model.role_dao as RoleDAO
from schemas import RoleSchema
from sqlalchemy.exc import SQLAlchemyError
from Data_model.permissions import authenticated_permission, superuser_permission


role_controller = Blueprint('role_api', __name__, url_prefix='/roles')

@role_controller.route('/')
class RoleList(MethodView):

    @role_controller.response(200, RoleSchema(many=True))
    @authenticated_permission.require(http_exception=403)
    def get(self):
        return RoleDAO.get_roles()
    
