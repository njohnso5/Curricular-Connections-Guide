# Import necessary modules and classes
from flask import request, send_from_directory
from Data_model.permissions import require_roles
from Data_model.models import RoleEnum
from schemas import (
    ProgramPostSchema,
    ProgramSchema,
    DepartmentListSchema,
    ProgramPutSchema,
    CourseSchema,
)
from flask_smorest import Blueprint, abort
from flask.views import MethodView
from datetime import datetime
import os
import ast
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
import Data_model.program_dao as prog_dao
import Data_model.showing_dao as show_dao
import Data_model.theme_dao as theme_dao
from werkzeug.exceptions import NotFound
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from dateutil import parser
from Data_model.permissions import (
    authenticated_permission,
    superuser_permission,
    ccg_permission,
)

# Create a Blueprint for the program API with a specified URL prefix
program_router = Blueprint("program_api", __name__, url_prefix="/program")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
DIR = Path(__file__, "../..").resolve()
IMAGE_DIR = DIR.joinpath("image_uploads/")


# Define a class for handling program-related requests
@program_router.route("/", methods=['GET', 'POST', 'PUT'])
class HandleProgram(MethodView):
    # Define a method to handle GET requests
    @program_router.response(200, ProgramSchema(many=True))
    def get(self):
        # Get the 'display' parameter from the URL
        display = request.args.get("display")

        # Check URL parameters for upcoming or past programs
        if display == "upcoming":
            today = datetime.now()
            programs = filter_programs(prog_dao.Showing.datetime >= today)
            return programs
        elif display == "past":
            today = datetime.now()
            programs = filter_programs(prog_dao.Showing.datetime < today)
            return programs
        else:
            # If URL param is not set or an incorrect value, get all programs
            programs = prog_dao.get_all()
            return programs

    # Define a method to handle POST requests
    @program_router.arguments(ProgramPostSchema, location="form")
    @program_router.response(200, ProgramSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def post(self, program_data):
        try:
            # Extract showings from program data
            showings = json.loads(program_data.pop("showings"))
            new_prg = prog_dao.Program(**program_data)
            new_prg.showings = []

            # Process each showing and add it to the program
            for show in showings:
                show["datetime"] = parser.parse(show["datetime"])
                new_show = show_dao.Showing(**show)
                new_prg.showings.append(new_show)
            # Upload program image if provided
            if "image" in request.files:
                filename = upload_file(request.files["image"], IMAGE_DIR)

                new_prg.image_filename = filename

            # Insert the new program into the database
            prog_dao.insert(new_prg)

            # Classify program themes and commit changes
            theme_dao.classify_program(new_prg, commit=True)

            return new_prg
        except SQLAlchemyError:
            abort(422, message="An SQL error occured during the operation")
    
    # Define a method to handle PUT requests for a specific program ID
    @program_router.arguments(ProgramPostSchema, location="form")
    @program_router.response(200, ProgramSchema)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def put(self, program_data: dict):
        try:
            programid = program_data["id"]
            # Extract showings from program data
            showings: dict = json.loads(program_data.pop("showings"))
            # Upload program image if provided
            if "image" in request.files:
                filename = upload_file(request.files["image"], IMAGE_DIR)
                program_data["image_filename"] = filename

            # Update the program without modifying showings yet
            program = prog_dao.get_by_id(programid)
            result = prog_dao.update(program_data, programid)
            
            if len(program.showings) > len(showings):
                flag = True
                for sho in program.showings:
                    for show in showings:
                        if (show.get("id") == sho.id):
                            flag = False
                    if flag:
                        show_dao.delete(sho.id)
                    flag = True
            # Parse each showing in the request data and check their states
            for show in showings: 
                db_show = show_dao.get_by_id(show.get("id"))
                if db_show is None:
                    dt = show.pop(
                        "datetime"
                    )  # Remove the datetime string as it must be parsed first
                    new_show = show_dao.Showing(**show)
                    new_show.datetime = parser.parse(dt)
                    show_dao.add_show_to_program(new_show, programid)
                # Update an existing showing
                elif db_show != None:
                    show_dao.update(show)
            theme_dao.classify_program(program, commit=True)
            return result
        except SQLAlchemyError:
            abort(500)

# Route to retrieve Departments that the frontend is allowed to use
@program_router.route("/departments/")
class GetDepartments(MethodView):
    @program_router.response(200, DepartmentListSchema)
    def get(self):
        # Get a list of department values and return as response
        return {"departments": prog_dao.get_departments()}


# Define a class for handling specific program IDs
@program_router.route("/<int:programid>/")
class HandleProgramID(MethodView):
    # Define a method to handle GET requests for a specific program ID
    @program_router.response(200, ProgramSchema)
    def get(self, programid):
        res = prog_dao.get_by_id(programid)
        return res


    # Define a method to handle DELETE requests for a specific program ID
    @program_router.response(200)
    @require_roles([RoleEnum.ADMIN, RoleEnum.CCG, RoleEnum.SUPERUSER]).require(http_exception=403)
    def delete(self, programid):
        prg = prog_dao.get_by_id(programid)
        filename = prg.image_filename
        if filename is not None and os.path.exists(IMAGE_DIR.joinpath(filename)):
            os.remove(IMAGE_DIR.joinpath(filename))
            # Path.unlink(IMAGE_DIR.joinpath(filename))
        prog_dao.delete(programid)

        return


# Define a class for handling program images
@program_router.route("/<int:programid>/image/")
class ProgramImage(MethodView):
    def get(self, programid):
        # Get the program and its image filename
        print("here")
        program = prog_dao.get_by_id(programid)
        filename = program.image_filename

        # If no image is stored, return a 404 error
        if filename is None:
            abort(404, message="no stored image")

        # Return the stored image file
        return send_from_directory(IMAGE_DIR, filename, mimetype="image/gif")

# Define a class for handling program images
@program_router.route("/<int:programid>/email/")
class SendEmail(MethodView):
    def post(self, programid):
        program = prog_dao.get_by_id(programid)
        title = program.title
        if program.link != "":
            title = """<a href=" """ + program.link + """">""" + program.title + """</a>"""
        courses = RelatedCourses.get(self, programid)
        emails = []
        for course in ast.literal_eval(courses.data.decode('utf-8')):
            faculties = course.get("faculty")
            for faculty in faculties:
                emails.append(faculty.get("email"))
        # set up intialization
        host = "smtp.gmail.com"
        port = 587
        sender = "testappemail123321123321@gmail.com"
        receiever = emails
        password = "xnna kllc pltu yfkp"
        message = MIMEMultipart()
        message['Subject'] = "Curicular Connections Guide"
        body = """
        <html>
            <body>
                <p>Greetings Faculty or Arts Partner,</p>

                <p>
                    In 2024, computer science students teamed up with Arts NC State to create an automated platform to connect course content to relevant art programming on campus as
                    part of the <a href="https://arts.ncsu.edu/about/for-nc-state-faculty/">Curricular Connections Guide.</a>\nYou are receiving this email because a course you teach may be connected to\n
                </p>
                <p>""" + title + """</p>
                <p>If you think there is a connection, please reach out to Amy Sawyers-Williams acsawyer@ncsu.edu about the opportunity for any of the following:<br>
                - Free tickets for your students to see the event (if ticketed)<br>
                - Offering extra credit for your students to attend the event<br>
                - Inviting an artist to visit your class and talk about the art form and/or issues</p>

                <p>We are still in the early stages of this automated program, so if you receive this in error, we apologize. Please let us know so we can update the system.</p>

                <p>If you do take action to connect your course, please reach out to Amy Sawyers-Williams so she can record this in her records: acsawyer@ncsu.edu.</p>
                <p>Thanks!<br>
                Amy Sawyers-Williams<br>
                Manager of Arts Outreach and Engagement<br>
                NC State University</p>
            </body>
        </html>
        """
        message.attach(MIMEText(body, 'html'))
        smtp = smtplib.SMTP(host, port)
        # Start connection to server
        smtp.starttls()
        #log in
        smtp.login(sender, password)
        #Send mail
        smtp.sendmail(sender, receiever, message.as_string())
        #end connection
        smtp.quit()
        return program



@program_router.route("/<int:programid>/courses/")
class RelatedCourses(MethodView):
    @program_router.response(200, CourseSchema(many=True))
    def get(self, programid):
        page = request.args.get("page") if request.args.get("page") else 1
        count = request.args.get("per_page") if request.args.get("per_page") else 3
        threshhold = (
            request.args.get("threshhold") if request.args.get("threshhold") else 5
        )
        try:
            print('here')
            
            courses = theme_dao.related_courses(
                programid, common_count=int(threshhold), page=int(page), count=int(count)
            )
            return courses
        except ValueError:
            abort(422, message="Bad query parameters")

    


# Define a function to filter programs based on a given expression
def filter_programs(expression: bool) -> list[prog_dao.Program]:
    programs = {}

    # Get showings based on the provided expression
    showings: list[prog_dao.Showing] = show_dao.get_showing_by_datetime_expression(
        expression
    )

    # Organize programs based on unique IDs from showings
    for show in showings:
        if programs.get(show.program_id) is None:
            prg: prog_dao.Program = prog_dao.get_by_id(show.program_id)
            programs[prg.id] = prg

    return list(programs.values())


# Define a function to upload a file to a specified location
def upload_file(file: FileStorage, location: str):
    if file.filename == "":
        return None
    if file and allowed_file(file.filename):
        sfilename = secure_filename(file.filename)
        file.save(os.path.join(location, sfilename))
        return sfilename
    return None


# Define a function to check if a given filename has an allowed extension
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
