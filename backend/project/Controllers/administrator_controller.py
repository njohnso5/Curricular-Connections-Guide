from flask_smorest import Blueprint, abort
from flask import g
from flask.views import MethodView
import Data_model.administrator_dao as AdministratorDAO
from schemas import AdministratorsSchema, AdministratorPostSchema, RoleSchema
from sqlalchemy.exc import SQLAlchemyError
from Data_model.models import  RoleEnum, AdminLog
from Data_model.permissions import require_roles
from Data_model.permissions import authenticated_permission, superuser_permission
from Utilities import logging


admin_controller = Blueprint('administrator_api', __name__, url_prefix='/administrators')

@admin_controller.route('/')
class AdministratorList(MethodView):

    @admin_controller.response(200, AdministratorsSchema(many=True))
    @require_roles([RoleEnum.ADMIN]).require(http_exception=403)
    def get(self):
        return AdministratorDAO.get_administrators()
    
    @admin_controller.arguments(AdministratorPostSchema)
    @admin_controller.response(200)
    @require_roles([RoleEnum.ADMIN]).require(http_exception=403)
    def post(self, administrator_data):
        try:
            log = AdminLog()
            log.call = "POST /v1/administrators/ HTTP/1.1 200"
            log.unity_id = g.user.unity_id
            result = AdministratorDAO.create_administrator(administrator_data)
            logging.logAPI(log)
            return result
        except SQLAlchemyError:
            abort(500, "Failed to create a new administrator")

@admin_controller.route('/<int:administrator_id>/')    
class AdministratorDetail(MethodView):

    @admin_controller.arguments(RoleSchema)
    @admin_controller.response(200, AdministratorsSchema)
    @require_roles([RoleEnum.ADMIN]).require(http_exception=403)
    def put(self, role_data, administrator_id):
        try:
            log = AdminLog()
            log.call = "PUT /v1/administrators/" + str(administrator_id) +"/ HTTP/1.1 200"
            log.unity_id = g.user.unity_id
            result = AdministratorDAO.update_administrator(administrator_id, role_data)
            logging.logAPI(log)
            return result
        except SQLAlchemyError:
            abort(500, "Failed to update administrator")

    @admin_controller.response(204)
    @require_roles([RoleEnum.ADMIN]).require(http_exception=403)
    def delete(self, administrator_id):
        try:
            log = AdminLog()
            log.call = "DELETE /v1/administrators/" + str(administrator_id) +"/ HTTP/1.1 200"
            log.unity_id = g.user.unity_id
            AdministratorDAO.delete_administrator(administrator_id)
            logging.logAPI(log)
            return {"message": "Administrator deleted"}
        except SQLAlchemyError:
            abort(500, "Failed to delete administrator")





        




