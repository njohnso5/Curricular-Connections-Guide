# Import necessary modules and classes
from flask import request, jsonify, current_app, make_response, Response, g
from flask_smorest import Blueprint, abort
from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError, ArgumentError
import Data_model.theme_dao as theme_dao
import Data_model.program_dao as program_dao
import Data_model.course_dao as course_dao
from Data_model.models import db, Theme, RoleEnum, AdminLog
from schemas import ThemeSchema, ThemePostSchema, CourseSchema
from Data_model.permissions import require_roles
from Utilities import logging

# Create a Blueprint for the theme API with a specified URL prefix
theme_router = Blueprint("theme_api", __name__, url_prefix="/themes")

@theme_router.route("/")
class ThemeList(MethodView):
    
    @theme_router.response(200, ThemeSchema(many=True))
    def get(self): # Process to retrieve all themes from db
        return Theme.query.all()
    
    # Define a method to handle POST requests to create a new theme
    @theme_router.arguments(ThemePostSchema, location="form")
    @theme_router.response(200, ThemeSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def post(self, theme_data):
        theme = Theme()
        theme.name = theme_data.get("name")  
    # Finish building the theme object and add it to the db
        try:
            log = AdminLog()
            log.call = "POST /v1/themes/ HTTP/1.1 200"
            log.unity_id = g.user.unity_id
            theme_dao.insert(theme)
            logging.logAPI(log)
        except SQLAlchemyError:
            abort(500, message="An error occured inserting the theme")
        except ArgumentError:
            abort(500, message="Theme object not part of session")

        return theme

# Define a route for handling GET and DELETE requests to /themes/<int:theme_id>/
@theme_router.route("/<int:theme_id>/", methods=["GET", "DELETE"])
def handle_theme_id(theme_id):
    if request.method == "GET":
        # If the request method is GET, retrieve the theme by its ID
        return make_response(jsonify(theme_dao.get_by_id(theme_id)), 200)

    if request.method == "DELETE":
        # If the request method is DELETE, delete the theme by its ID
        try:
            log = AdminLog()
            log.call = "DELETE /v1/themes/" + str(theme_id) + "/ HTTP/1.1 200"
            log.unity_id = g.user.unity_id
            theme_dao.delete(theme_id)
            logging.logAPI(log)
        except SQLAlchemyError:
            abort(500, message="An error occured inserting the theme")
        except ArgumentError:
            abort(500, message="Theme object not part of session")

        # Return a JSON response indicating successful deletion and a status code of 200
        return make_response(jsonify({"success": "Theme deleted"}), 200)

@theme_router.route("/program/<int:program_id>/")
class ThemeListByProgram(MethodView):
    @theme_router.response(200, ThemeSchema(many=True))
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def get(self, program_id):
        return program_dao.get_by_id(program_id).themes

    @theme_router.arguments(ThemeSchema(many=True), location="json")
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def put(self, themes, program_id):
        if program_dao.update_program_themes(program_id, themes):
            return make_response(jsonify({"success": "Themes updated"}), 200)
        else:
            abort(500, message="An error occured updating the themes")


@theme_router.route("/course/<int:course_id>/")
class ThemeListByCourse(MethodView):
    @theme_router.response(200, ThemeSchema(many=True))
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def get(self, course_id):
        return theme_dao.get_by_course(course_id).themes

    @theme_router.arguments(ThemeSchema(many=True), location="json")
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def put(self, themes, course_id):
        print(themes)
        print(course_id)
        if course_dao.update_course_themes(course_id, themes):
            return make_response(jsonify({"success": "Themes updated"}), 200)
        else:
            abort(500, message="An error occured updating the themes")
        