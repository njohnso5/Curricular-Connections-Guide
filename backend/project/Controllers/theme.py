# Import necessary modules and classes
from flask import request, jsonify, current_app, make_response, Response
from flask_smorest import Blueprint, abort
from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError, ArgumentError
import Data_model.theme_dao as theme_dao
from Data_model.models import db, Theme, RoleEnum
from schemas import ThemeSchema, ThemePostSchema, CourseSchema
from Data_model.permissions import require_roles

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
            theme_dao.insert(theme)
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
        theme_dao.delete(theme_id)

        # Return a JSON response indicating successful deletion and a status code of 200
        return make_response(jsonify({"success": "Theme deleted"}), 200)
