from flask_smorest import Blueprint, abort
from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError
from schemas import CoursePostSchema, CourseSchema
from Data_model.models import db, Course, RoleEnum, Course_to_Faculty, Course_to_Theme
from flask import request
from Data_model.permissions import require_roles
import Data_model.course_dao as course_dao
import Data_model.theme_dao as theme_dao

# Build this blueprint of routes with the '/course' prefix
course_controller = Blueprint('course_api', __name__, url_prefix='/courses')

# # Routes for retrieving all courses from db or creating a new one and adding it
@course_controller.route('/')
class CourseList(MethodView): 

    @course_controller.response(200, CourseSchema(many=True))
    def get(self): # Process to retrieve all courses from db
        return Course.query.all()
    
    @course_controller.arguments(CoursePostSchema, location="form")
    @course_controller.response(200, CourseSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def post(self, program_data):
        new_course = course_dao.Course(**program_data)
        course_dao.insert(new_course)

        # Classify program themes and commit changes
        theme_dao.classify_program(new_course, commit=True)

        return new_course

# Define a method for handling an array of courses by id
#   /**
#    * Remove a list of courses
#    */
#   removeCourses(courseIds: Number[] ) {
#     return axios.delete(API_URL + { data: courseIds } + "/");
#   }

@course_controller.route('delete/')
class DeleteCourses(MethodView):

    # Define a method to handle DELETE requests
    @course_controller.response(204)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def delete(self):
        # print('Api successfully called')

        try:
            data = request.get_json()
            print(data)
            course_ids = data.get('courseIds', [])
            for course_id in course_ids:
                course_dao.delete_course(course_id)
        except SQLAlchemyError as e:
            print(e)
            abort(400, message="Error deleting courses")
        # print('Course deleted')
        return {'message': 'Courses deleted successfully'}
    