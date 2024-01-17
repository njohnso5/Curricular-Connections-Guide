from flask import request, jsonify, current_app, make_response, Blueprint
from datetime import datetime
from Data_model import showing_dao as show_dao

# Create a Blueprint for the showing API with a specified URL prefix
showing_router = Blueprint("showing_api", __name__, url_prefix="/showing")


# Define a route for handling GET and POST requests to /showing/
@showing_router.route("/", methods=["GET", "POST"])
def get_showings():
    if request.method == "GET":
        # If the request method is GET, retrieve all showings
        showings: list[show_dao.Showing] = show_dao.get_all()

        # Return a JSON response with the retrieved showings and a status code of 200
        return make_response(jsonify(showings), 200)
    elif request.method == "POST":
        # If the request method is POST, return a teapot response with a status code of 418
        return make_response(jsonify({"message": "I'm a teapot"}), 418)


# Define a route for handling GET and DELETE requests to /showing/<int:showing_id>/
@showing_router.route("/<int:showing_id>/", methods=["GET", "DELETE"])
def handle_showing(showing_id):
    if request.method == "GET":
        # If the request method is GET, retrieve the showing by its ID
        show = show_dao.get_by_id(showing_id)

        # Return a JSON response with the retrieved showing and a status code of 200
        return make_response(jsonify(show), 200)

    elif request.method == "DELETE":
        # If the request method is DELETE, delete the showing by its ID
        show_dao.delete(showing_id)

        # Return a JSON response indicating successful deletion and a status code of 200
        return make_response(jsonify({"success": "delete succeeded"}), 200)
