from flask import request, g
from flask_smorest import Blueprint, abort
from flask.views import MethodView
import json
import binascii
from sqlalchemy.exc import SQLAlchemyError, ArgumentError
from schemas.semester import SemesterPostSchema, SemesterSchema, SemesterUpdateSchema
from schemas.course import CourseSchema
from Data_model.models import Semester, Subject, Course, Faculty, RoleEnum, AdminLog
from Data_model.permissions import require_roles
import Data_model.semester_dao as dao
import Data_model.subject_dao as subject_dao
import Data_model.course_dao as course_dao
import Data_model.theme_dao as theme_dao
import Data_model.faculty_dao as faculty_dao
from Data_model.models import db
from werkzeug.utils import secure_filename
import pandas, re
from Utilities import logging

def validate_email(email):
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if re.match(pattern, email):
        return True
    else:
        return False

# Build this blueprint of routes with the '/course' prefix
semester_controller = Blueprint('semester_api', __name__, url_prefix='/semesters')

@semester_controller.route('/')
class SemesterList(MethodView):

    @semester_controller.response(200, SemesterSchema(many=True))
    def get(self):
        # active = request.args.get("active")

        # if active != None and active:
        #     print("Found active semester")
        #     return dao.get_by_filter(active=True)
        
        return dao.get_all()
    
    @semester_controller.arguments(SemesterPostSchema, location='form')
    @semester_controller.response(200, SemesterSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def post(self, semester_data):
        # Initializes necessary lists
        course_list = []
        course_ids = []
        # Sets up new semester    
        semester = Semester()
        semester.year = semester_data.get("year")
        semester.period_id = semester_data.get("period_id")
        semester.active = semester_data.get("active")
        
        # Checks if semester already exists
        print(semester.year, semester.period_id, "line 128")
        if dao.get_by_filter(db.and_(dao.Semester.year == semester.year, dao.Semester.period_id == semester.period_id)):
            abort(409, message="Semester already exists")
        try:
            log = AdminLog()
            log.call = "POST /v1/semesters/ HTTP/1.1 200"
            log.unity_id = g.user.unity_id
            dao.insert_semester(semester)
            logging.logAPI(log)
        except SQLAlchemyError:
            abort(500, message="An error occured inserting the semester")
        if (len(request.files) != 0):
            # Sets up the file to be read
            catalog_file = request.files["catalog"]
            filename = secure_filename(catalog_file.filename)
            filetype = filename.split('.')[1]
            supported_filetypes = ['xls', 'xlsx', 'xlsm', 'xlsb', 'odf', 'ods', 'odt']
            # Confirms that the file type is a supported spreadsheet format and reads data from spreadsheet
            if filetype == 'csv':
                df = pandas.read_csv(catalog_file, encoding="latin-1")
            elif filetype not in supported_filetypes:
                abort(415, message="Error: Unsupported Media Type")
            else: 
                df = pandas.read_excel(catalog_file, 0)
            # Iterates through every course
            for i in range(0, df.shape[0]):
                # Creates a new course
                course = Course()

                # Reads the id from the database into a variable
                course_id = df.iloc[i, 0]
                # print(course_id)
                # Confirms that id field is a number not yet parsed
                if not pandas.isna(course_id) and str(course_id).isdigit() and not course_ids.__contains__(course_id):
                    # Adds id to list used to skip duplicates
                    course_ids.append(course_id)
                    # Gets subject of course
                    subject = df.iloc[i, 1]               
                
                    # print(subject)
                    # Checks if subject exists
                    db_subject = subject_dao.get_subject_by_name(subject_dao.Subject.subject==subject)
                    # If subject doesn't exist, creates the subject
                    if db_subject is None:
                        db_subject = Subject()
                        db_subject.subject = subject
                        subject_dao.insert(db_subject)
                    # Reads in course information
                    num = df.iloc[i, 1 + 1].encode(encoding='latin-1')
                    # If is a float
                    if isinstance(num, float):
                        course.catalog_number = int(float(num))
                    else:
                        course.catalog_number = int(str(df.iloc[i, 1 + 1]))
                    # print(df.iloc[i, 1 + 1])
                    print(course.catalog_number)
                    course.title_long = df.iloc[i, 1 + 2]
                    course.title_short = df.iloc[i, 1 + 3]
                    # Reads in description or autofills with empty description
                    course.description = df.iloc[i, 1 + 4]
                    if pandas.isna(course.description):
                        course.description = ""
    
                    # Reads in special topics descriptions or autofills with empty descriptions
                    course.topics_description = df.iloc[i, 1 + 7]
                    if pandas.isna(course.topics_description):
                        course.topics_description = ""
                    
                    # Adds ids of subject and semester objects to course
                    course.subject_id = db_subject.id
                    course.semester_id = semester.id 
                    # Sets the emails of instructors of the course
                    emails = str(df.iloc[i, 1 + 9])
                    # Separates faculty from the emails and adds them to a list of faculty
                    faculty_list = []
                    names = str(df.iloc[i, 1 + 8])
                    emails_string = emails.split(";")
                    names_string = names.split(";")
                    # print(names_string)
                    count = 0
                    for email in emails_string:
                        # print(email, "line 121")
                        # print(pandas.isna(email))
                        if pandas.isna(email) or not validate_email(email):
                            continue
                        db_faculty = faculty_dao.get_faculty_by_name(faculty_dao.Faculty.email==email)
                        # print(db_faculty)
                        if db_faculty is None:
                            db_faculty = Faculty()
                            db_faculty.name = names_string[count]
                            # print(db_faculty.name)
                            db_faculty.email = email
                            faculty_dao.insert_faculty(db_faculty)

                        if db_faculty not in faculty_list:
                            faculty_list.append(db_faculty)        
                            
                        count +=1            
                    # print(faculty_list)
                    course.faculty = faculty_list
                    # Adds course to the semester course list
                    course_list.append(course)
            # print(str(len(course_list)) + " courses being added")
            try:
                print("Courses being added")
                # Adds courses to the database
                course_dao.insert_many(course_list)
                print("Course DAO done")
                # Runs the theme classifier on all courses
                theme_dao.classify_course_bulk(course_list, commit=True)
                print("Courses have been added")
            except SQLAlchemyError:
                abort(500, message="An error occured inserting the courses")
            except ArgumentError:
                abort(500, message="Course object not part of session")
        
        # Returns the new semester object
        return semester
    
@semester_controller.route('/active/')
class ActiveSemester(MethodView):
    
    @semester_controller.response(200, SemesterSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def get(self):
        semester = dao.get_active()
        print(semester)
        return semester
    
    @semester_controller.arguments(SemesterUpdateSchema, location="form")
    @semester_controller.response(200, SemesterSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def put(self, semester_data):
        print("Semester Data: " + str(semester_data))
        semester: Semester = dao.get_by_id(int(semester_data.get("id")))
        # print(str(semester.id))
        semester.active = semester_data.get("active")

        # for field, value in semester_data.items():
        #     if hasattr(semester, field):
        #         setattr(semester, field, value)
        
        # print("Current Semester Active? " + str(semester.active))
        try:
            dao.update_semester(semester)
            print("Is semester " + str(semester.id) + " now active? " + str(semester.active))
        except SQLAlchemyError:
            abort(500, message="An error occured updating the semester")

        return semester
    
# @semester_controller.route('/active/<int:semester_id>/')
# class ChangeActiveSemester(MethodView):
#     # @semester_controller.arguments(SemesterUpdateSchema)
#     @semester_controller.response(200, SemesterSchema)
#     @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
#     def put(self, semester_data: dict):
#         semester: Semester = dao.get_by_id(semester_data.get("id"))
#         semester.active = semester_data.get("active")

#         # for field, value in semester_data.items():
#         #     if hasattr(semester, field):
#         #         setattr(semester, field, value)
        
#         print("Current Semester Active? " + str(semester.active))
#         try:
#             dao.update_semester(semester)
#         except SQLAlchemyError:
#             abort(500, message="An error occured updating the semester")

#         return semester
    
@semester_controller.route('/<int:semester_id>/')
class SemesterDetail(MethodView):

    @semester_controller.arguments(SemesterUpdateSchema)
    @semester_controller.response(200, SemesterSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def put(self, semester_data: dict, semester_id):
        semester: Semester = dao.get_by_id(semester_id)
        
        for field, value in semester_data.items():
            if hasattr(semester, field):
                setattr(semester, field, value)
        try:
            dao.update_semester(semester)
        except SQLAlchemyError:
            abort(500, message="An error occured updating the semester")

        return semester
        

    @semester_controller.response(204)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def delete(self, semester_id):
        semester: Semester = dao.get_by_id(semester_id)

        try:
            log = AdminLog()
            log.call = "DELETE /v1/semesters/" + str(semester) + "/ HTTP/1.1 200"
            log.unity_id = g.user.unity_id
            dao.delete_semester(semester)
            faculty_dao.delete_unassociated_faculty()
            logging.logAPI(log)
        except SQLAlchemyError as e:
            print(e)
            abort(500, message="An error occured deleting the semester")

        return {"message": "Semester deleted"}

        
@semester_controller.route('/<int:semester_id>/courses/')
class SemesterCourseList(MethodView):

    @semester_controller.response(200, CourseSchema(many=True))
    def get(self, semester_id):
        semester: Semester = dao.get_by_id(semester_id)
        return semester.courses
    
@semester_controller.route('/<int:semester_id>/')
class SingleSemester(MethodView):

    @semester_controller.response(200, SemesterSchema)
    def get(self, semester_id):
        semester: Semester = dao.get_by_id(semester_id)
        return semester


@semester_controller.route("/<int:semesterid>/courses/pages/")
class SemesterCoursePagination(MethodView):
    @semester_controller.response(200, CourseSchema(many=True))
    def get(self, semesterid):
        page = request.args.get("page")
        count = request.args.get("count")
        
        if not page or not count:
            abort(422, message="bad query parameters")
        page = int(page)
        count = int(count)
        if page < 0 or count < 0:
            abort(422, message="bad query parameters")
        return course_dao.get_semester_courses_as_page(semesterid, page, count)
        