# Import necessary modules and functions from Flask
from flask import request, send_from_directory
from flask_smorest import Blueprint, abort
from flask.views import MethodView

# Import schemas for data validation and serialization
from schemas import (
    ThemeSearchSchema,
    ThemeSchema,
    ProgramSchema,
    CourseSchema,
    SearchProgramSchema,
    SearchCourseSchema,
)

# Import data access objects (DAOs) from the Data_model module
from Data_model import theme_dao, program_dao, showing_dao, course_dao

# Create a Blueprint for the search-related APIs
search_controller = Blueprint("search_api", __name__, url_prefix="/search")

# Endpoint for searching programs based on specified criteria
@search_controller.route("/")
class ProgramSearch(MethodView):
    # Define endpoint for POST requests with search criteria
    @search_controller.arguments(SearchProgramSchema)
    @search_controller.response(200, ProgramSchema(many=True))
    def post(self, search_data: dict):
        # Perform a search for programs using data from the request
        programs = program_dao.search(**search_data)
        return programs

# Endpoint for searching courses based on specified themes
@search_controller.route("/themes/courses/")
class SearchCoursesByManyThemes(MethodView):
    # Define endpoint for POST requests with theme search criteria
    @search_controller.arguments(ThemeSearchSchema)
    @search_controller.response(200, CourseSchema(many=True))
    def post(self, search_data):
        # Retrieve courses based on specified themes
        result = theme_dao.search_courses_by_themes(search_data.themes)
        return result

# Endpoint for searching programs based on specified themes
@search_controller.route("/themes/programs/")
class SearchCoursesByManyThemes(MethodView):
    # Define endpoint for POST requests with theme search criteria
    @search_controller.arguments(ThemeSearchSchema)
    @search_controller.response(200, ProgramSchema(many=True))
    def post(self, search_data):
        # Retrieve programs based on specified themes
        result = theme_dao.search_programs_by_themes(search_data.themes)
        return result
