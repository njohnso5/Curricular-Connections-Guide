from flask import Blueprint
from Controllers import (
    course_controller,
    semester_controller,
    period_controller,
    program_router,
    theme_router,
    showing_router,
    admin_controller,
    user_controller,
    role_controller,
    search_controller
)

#Combine the routes of the all of the controllers under a parent route with the prefix "/v1"
#The reverse proxy will peal off the /api prefix of a url path in this system
api = Blueprint('api_controller', __name__, url_prefix="/v1")
api.register_blueprint(showing_router )
api.register_blueprint(course_controller)
api.register_blueprint(semester_controller)
api.register_blueprint(period_controller)
api.register_blueprint(program_router)
api.register_blueprint(theme_router)
api.register_blueprint(admin_controller)
api.register_blueprint(user_controller)
api.register_blueprint(role_controller)
api.register_blueprint(search_controller)

