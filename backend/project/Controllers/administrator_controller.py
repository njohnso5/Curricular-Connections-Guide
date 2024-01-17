from flask_smorest import Blueprint, abort
from flask.views import MethodView
import Data_model.administrator_dao as AdministratorDAO
from schemas import AdministratorsSchema, AdministratorPostSchema, RoleSchema
from sqlalchemy.exc import SQLAlchemyError
from Data_model.permissions import authenticated_permission, superuser_permission


admin_controller = Blueprint('administrator_api', __name__, url_prefix='/administrators')

@admin_controller.route('/')
class AdministratorList(MethodView):

    @admin_controller.response(200, AdministratorsSchema(many=True))
    @authenticated_permission.require(http_exception=403)
    def get(self):
        return AdministratorDAO.get_administrators()
    
    @admin_controller.arguments(AdministratorPostSchema)
    @admin_controller.response(200, AdministratorsSchema)
    def post(self, administrator_data):
        try:
            return AdministratorDAO.create_administrator(administrator_data)
        except SQLAlchemyError:
            abort(500, "Failed to create a new administrator")

@admin_controller.route('/<int:administrator_id>/')    
class AdministratorDetail(MethodView):

    @admin_controller.arguments(RoleSchema)
    @admin_controller.response(200, AdministratorsSchema)
    @superuser_permission.require(http_exception=403)
    def put(self, role_data, administrator_id):
        try:
            return AdministratorDAO.update_administrator(administrator_id, role_data)
        except SQLAlchemyError:
            abort(500, "Failed to update administrator")

    @admin_controller.response(204)
    @superuser_permission.require(http_exception=403)
    def delete(self, administrator_id):
        try:
            AdministratorDAO.delete_administrator(administrator_id)
            return {"message": "Administrator deleted"}
        except SQLAlchemyError:
            abort(500, "Failed to delete administrator")





        




