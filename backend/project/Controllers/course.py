from flask_smorest import Blueprint, abort
from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError
from schemas import CoursePostSchema, CourseSchema
from Data_model.models import db, Course

# Build this blueprint of routes with the '/course' prefix
course_controller = Blueprint('course_api', __name__, url_prefix='/courses')

# # Routes for retrieving all courses from db or creating a new one and adding it
@course_controller.route('/')
class CourseList(MethodView): 

    @course_controller.response(200, CourseSchema(many=True))
    def get(self): # Process to retrieve all courses from db
        return Course.query.all()
