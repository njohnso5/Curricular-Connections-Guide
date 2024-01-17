from flask import request
from flask_smorest import Blueprint, abort
from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError, ArgumentError
from schemas.semester import SemesterPostSchema, SemesterSchema, SemesterUpdateSchema
from schemas.course import CourseSchema
from Data_model.models import Semester, Subject, Course, Faculty, RoleEnum
from Data_model.permissions import require_roles
import Data_model.semester_dao as dao
import Data_model.subject_dao as subject_dao
import Data_model.course_dao as course_dao
import Data_model.theme_dao as theme_dao
import Data_model.faculty_dao as faculty_dao
from Data_model.models import db
from werkzeug.utils import secure_filename
import pandas

# Build this blueprint of routes with the '/course' prefix
semester_controller = Blueprint('semester_api', __name__, url_prefix='/semesters')

@semester_controller.route('/')
class SemesterList(MethodView):

    @semester_controller.response(200, SemesterSchema(many=True))
    def get(self):
        active = request.args.get("active")

        if active != None and active:
            return dao.get_by_filter(active=True)
        
        return dao.get_all()
    
    @semester_controller.arguments(SemesterPostSchema, location='form')
    @semester_controller.response(201, SemesterSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def post(self, semester_data):

        course_list = []
        catalog_file = request.files["catalog"]
        filename = secure_filename(catalog_file.filename)
        filetype = filename.split('.')[1]
        supported_filetypes = ['xls', 'xlsx', 'xlsm', 'xlsb', 'odf', 'ods', 'odt']
        if filetype == 'csv':
            df = pandas.read_csv(catalog_file)
        elif filetype not in supported_filetypes:
            abort(415, message="Error: Unsupported Media Type")
        else: 
            df = pandas.read_excel(catalog_file, 0)
            
        semester = Semester()
        semester.year = semester_data.get("year")
        semester.period_id = semester_data.get("period_id")
        semester.active = semester_data.get("active")
    
        try:
            dao.insert_semester(semester)
        except SQLAlchemyError:
            abort(500, message="An error occured inserting the semester")
        
        for i in range(0, df.shape[0]):
            course = Course()
            course.title_short = df.iloc[i,1]
            course.title_long = df.iloc[i, 1 + 1]
            course.description = df.iloc[i, 1 + 2]
            if pandas.isna(course.description):
                course.description = ""
            subject = df.iloc[i, 1 + 3]               
            
            db_subject = subject_dao.get_subject_by_name(subject_dao.Subject.subject==subject)
        
            if db_subject is None:
                db_subject = Subject()
                db_subject.subject = subject
                subject_dao.insert(db_subject)
        
            course.subject_id = db_subject.id
            course.semester_id = semester.id 
            course.catalog_number = df.iloc[i, 1 + 4]
            
            emails = str(df.iloc[i, 1 + 6])
            
            faculty_list = []
            
            emails_string = emails.split(";")
                            
            for email in emails_string:
            
                if pandas.isna(email):
                    continue
            
                db_faculty = faculty_dao.get_faculty_by_name(faculty_dao.Faculty.email==email)
                
                if db_faculty is None:
                    db_faculty = Faculty()
                    db_faculty.email = email
                    faculty_dao.insert_faculty(db_faculty)
                faculty_list.append(db_faculty)                
                
            course.faculty = faculty_list
            course_list.append(course)

        print(str(len(course_list)) + " courses being added")
        try:
            course_dao.insert_many(course_list)
            theme_dao.classify_course_bulk(course_list, commit=True)
        except SQLAlchemyError:
            abort(500, message="An error occured inserting the courses")
        except ArgumentError:
            abort(500, message="Course object not part of session")
                
        return semester
    
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
            dao.insert(semester)
        except SQLAlchemyError:
            abort(500, message="An error occured updating the semester")

        return semester
        

    @semester_controller.response(204)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def delete(self, semester_id):
        semester: Semester = dao.get_by_id(semester_id)

        try:
            dao.delete_semester(semester)
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
        