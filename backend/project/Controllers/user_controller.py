from flask import g, jsonify, make_response
from flask_smorest import Blueprint
from flask.views import MethodView
from schemas import AdministratorsSchema

user_controller = Blueprint('user_api', __name__, url_prefix="/users")

@user_controller.route('/current/')
class UserDetail(MethodView):

    @user_controller.response(200, AdministratorsSchema)
    def get(self):
        if g.user == None: 
            return make_response(jsonify({"message": "No currently signed in user"}), 401)

        return g.user

    

