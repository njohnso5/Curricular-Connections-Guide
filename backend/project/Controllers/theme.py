# Import necessary modules and classes
from flask import request, jsonify, current_app, make_response, Blueprint, Response
import Data_model.theme_dao as theme_dao

# Create a Blueprint for the theme API with a specified URL prefix
theme_router = Blueprint("theme_api", __name__, url_prefix="/themes")


# Define a route for handling GET and POST requests
@theme_router.route("/", methods=["GET", "POST"])
def handle_themes():
    if request.method == "GET":
        # Get program_id and course_id from the request URL parameters
        program_id = request.args.get("program_id")
        course_id = request.args.get("course_id")

        # If both program_id and course_id are provided, find common themes
        if program_id and course_id:
            return make_response(
                jsonify(theme_dao.find_common_themes(course_id, program_id)), 200
            )

        # If not, return all themes
        return make_response(jsonify(theme_dao.get_all()), 200)

    if request.method == "POST":
        # Check if the request's mimetype is 'application/json'
        if not request.is_json:
            return make_response(jsonify({"Error": "Unsupported Media Type"}), 415)

        # Extract JSON body from the request
        body: dict = request.get_json()

        # Check if the required key "theme_name" is present in the body
        if body.get("theme_name") is None:
            return make_response(jsonify({"Error": "Unprocessable Content"}), 422)

        # Insert the new theme and return the result
        return make_response(jsonify(theme_dao.insert(body.get("theme_name"))), 200)


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


# Define a route for handling GET requests to specific Themes
@theme_router.route("/<int:theme_id>/programs/", methods=["GET"])
def get_programs_by_theme(theme_id):
    # Get programs associated with the specified theme_id
    result = theme_dao.find_programs(theme_id)

    # Return a JSON response with the result and a status code of 200
    return make_response(jsonify(result), 200)


# Define a route for handling GET requests to /themes/<int:theme_id>/courses/
@theme_router.route("/<int:theme_id>/courses/", methods=["GET"])
def get_courses_by_theme(theme_id):
    # Get courses associated with the specified theme_id
    result = theme_dao.find_courses(theme_id)

    # Return a JSON response with the result and a status code of 200
    return make_response(jsonify(result), 200)


# Define a route for handling POST requests to /themes/search/
@theme_router.route("/search/", methods=["POST"])
def SearchByManyThemes():
    # Request must have the mimetype 'application/json'
    if not request.is_json:
        return make_response(jsonify({"error": "unsupported media type"}), 415)

    # Request body must have a list of integers representing theme ids with the key "themes"
    themes: list[int] = (
        request.json.get("themes") if request.json.get("themes") is not None else []
    )

    # Check if all elements in the themes list are integers
    if not all(isinstance(t, int) for t in themes):
        return make_response(jsonify({"error": "bad request"}), 400)

    # Check for URL parameter to determine whether to search by "programs" or "courses"
    search_by = request.args.get("search_by")

    # Perform the search based on the specified search_by parameter
    if search_by == "courses":
        result = theme_dao.search_courses_by_themes(themes)
        return make_response(jsonify(result))
    elif search_by == "programs":
        result = theme_dao.search_programs_by_themes(themes)
        return make_response(jsonify(result))
    else:
        # Return an empty list if no valid query parameter is set
        return make_response(jsonify([]), 200)
