from flask_smorest import Blueprint, abort
from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError, ArgumentError
from schemas import CoursePostSchema, CourseSchema
from Data_model.models import db, Course, RoleEnum, Course_to_Faculty, Course_to_Theme, Faculty, Theme, Subject
from flask import request
from Data_model.permissions import require_roles
import Data_model.course_dao as course_dao
import Data_model.theme_dao as theme_dao
import Data_model.faculty_dao as faculty_dao
import Data_model.subject_dao as subject_dao
import pandas


# Build this blueprint of routes with the '/course' prefix
course_controller = Blueprint('course_api', __name__, url_prefix='/courses')

# # Routes for retrieving all courses from db or creating a new one and adding it
@course_controller.route('/')
class CourseList(MethodView): 

    @course_controller.response(200, CourseSchema(many=True))
    def get(self): # Process to retrieve all courses from db
        return Course.query.all()
    
    # Define a method to handle POST requests to create a new course
    @course_controller.arguments(CoursePostSchema, location="form")
    @course_controller.response(200, CourseSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def post(self, course_data): # Process to create a new course and add it to db
        # print("adding course api")
        # print(course_data)
        # Example of course_data
        # course_data = {
        #     "title_short": "Software eng",
        #     "title_long": "Software engineering",
        #     "description": "This is a course about software engineering",
        #     "subject": "CSC",
        #     "catalog_number": 326,
        #     "faculty": "Dr.me;Dr.you;Dr.them",
        #     "emails": "me.ncsu.edu;you.ncsu.edu;them.ncsu.edu",
        #     "semester_id": 1,
        # }

        course = Course()
        course.title_short = course_data.get("title_short")
        course.title_long = course_data.get("title_long")
        course.description = course_data.get("description")
    
        subject = course_data.get("subject")
        db_subject = subject_dao.get_subject_by_name(subject_dao.Subject.subject==subject)
        if db_subject is None:
            db_subject = Subject()
            db_subject.subject = subject
            subject_dao.insert(db_subject)


        course.subject_id = db_subject.id

        course.semester_id = course_data.get("semester_id")
        course.catalog_number = course_data.get("catalog_number")   

        faculty_list = []
        for email in course_data.get("emails").split(";"):
            if pandas.isna(email):
                continue

            db_faculty = faculty_dao.get_faculty_by_name(faculty_dao.Faculty.email==email)
            
            if db_faculty is None:
                db_faculty = Faculty()
                db_faculty.email = email
                db_faculty.name = course_data.get("faculty").split(";")[course_data.get("emails").split(";").index(email)]
                faculty_dao.insert_faculty(db_faculty)
            
            faculty_list.append(db_faculty)

            course.faculty = faculty_list
        # Finish building the course object and add it to the db
        try:
            course_dao.insert_course(course)
            theme_dao.classify_course(course, commit=True)
        except SQLAlchemyError:
            abort(500, message="An error occured inserting the course")
        except ArgumentError:
            abort(500, message="Course object not part of session")

        return course

    @course_controller.arguments(CoursePostSchema, location="form")
    @course_controller.response(200, CourseSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def put(self, course_data):
        # print(course_data)
        emails = course_data.get("emails").split(";")
        names = course_data.get("faculty").split(";")
        if len(emails) != len(names):
            abort(500, message="Emails and names do not match")
        course = course_dao.get_by_id(course_data.get("course_id"))
        course.title_short = course_data.get("title_short")
        course.title_long = course_data.get("title_long")
        course.description = course_data.get("description")
        
        if course_data.get("subject") != course.subject.subject:
            db_subject = subject_dao.get_subject_by_name(subject_dao.Subject.subject==course_data.get("subject"))
            if db_subject is None:
                db_subject = Subject()
                db_subject.subject = course_data.get("subject")
                subject_dao.insert(db_subject)
                 
            course.subject_id = db_subject.id
        course.catalog_number = course_data.get("catalog_number")
        
        # Check if the faculty has been updated
        faculty_list = []

        for email in emails:
            if pandas.isna(email):
                continue
            # Risk of updating faculty email, it will create a new faculty with the same name
            db_faculty = faculty_dao.get_faculty_by_name(faculty_dao.Faculty.email==email)
            if db_faculty is None:
                db_faculty = Faculty()
                db_faculty.email = email
                db_faculty.name = names[emails.index(email)]
                faculty_dao.insert_faculty(db_faculty)
            else:
                db_faculty.name = names[emails.index(email)]
                faculty_dao.update_faculty(db_faculty)
            faculty_list.append(db_faculty)


        try:
            course_dao.update_course(course)
            theme_dao.classify_course(course, commit=True)
        except SQLAlchemyError:
            abort(500, message="An error occured updating the course")
        except ArgumentError:
            abort(500, message="Course object not part of session")


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
    