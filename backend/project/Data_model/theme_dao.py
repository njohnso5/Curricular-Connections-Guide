from Data_model.models import (
    Program,
    Course,
    Theme,
    db,
    Program_to_Theme,
    Course_to_Theme,
)
import Data_model.program_dao as prog_dao
from Tagging import Classifier
from sqlalchemy.orm.session import object_session
from sqlalchemy import func
from sqlalchemy.exc import ArgumentError
from werkzeug.exceptions import NotFound


# Get all Themes from the database
def get_all():
    return Theme.query.all()


# Get all themes associated with a program specified by a program's id, raises a 404 error if no program found
def get_from_program(programid: int) -> list[Theme]:
    program = Program.query.get_or_404(programid)
    return program.themes


# Get all themes associated with a course specified by a course's id, raises a 404 error if no course found
def get_from_course(courseid: int) -> list[Theme]:
    course: Course = Course.query.get_or_404(courseid)
    return course.themes


# Get a theme by its id, raises a 404 error if none found
def get_by_id(id: int):
    return Theme.query.get_or_404(id)


# Get a theme by its unique name, raises a 404 error if none found
def get_by_name(name: str):
    return Theme.query.filter(Theme.name == name).first_or_404()


# Insert a theme into the database
def insert(theme: Theme):
    db.session.add(theme)
    db.session.commit()


# Insert a series of themes into the db, parameter must be a list of strings as the theme names
def insert_from_list(themes: list[str]):
    add_themes: list[Theme] = []

    for theme in themes:
        new_theme: Theme = Theme()
        new_theme.name = theme

        add_themes.append(new_theme)

    db.session.add_all(add_themes)
    db.session.commit()


# Insert a new theme name into the database
def insert(theme: str):
    new_theme = Theme()
    new_theme.name = theme

    db.session.add(new_theme)
    db.session.commit()

    return new_theme


# Deletes a theme from the database by its id
def delete(theme_id: int):
    theme = Theme.query.get_or_404(theme_id)

    prgs: list[Program] = find_programs(theme_id)
    [p.themes.remove(theme) for p in prgs]

    crcs: list[Course] = find_courses(theme_id)
    [c.themes.remove(theme) for c in crcs]

    Theme.query.filter(Theme.id == theme_id).delete()
    db.session.commit()


# Discovers a set of themes that are related to a given program. If the commit parameter is True, the theme associations are saved to the database so long as the given Program object is stored in the engine session.
def classify_program(program: Program, commit: bool = False):
    themes = Theme.query.all()

    clss = Classifier()
    clss.set_description(program.description)
    clss.set_themes(themes)

    predicted_themes = clss.classify()

    if commit:
        if object_session(program) is None:
            raise ArgumentError("Program object not part of session")
        program.themes.extend(predicted_themes)
        db.session.commit()
    return predicted_themes


# Discovers a set of themes that are related to a given course. If the commit parameter is True, the theme associations are saved to the database so long as the given Course object is stored in the engine session.
def classify_course(course: Course, commit: bool = False):
    themes = Theme.query.all()

    clss = Classifier()
    clss.set_themes(themes)
    clss.set_description(course.description)

    predicted_themes = clss.classify()

    if commit:
        if object_session(course) is None:
            raise ArgumentError("Course object not part of session")
        course.themes.extend(predicted_themes)
        db.session.commit()
    return predicted_themes


# Discovers a set of themes that are related to a given course. If the commit parameter is True, the theme associations are saved to the database so long as the given Course object is stored in the engine session.
def classify_course_bulk(courses: list[Course], commit: bool = False):
    themes = Theme.query.all()

    clss = Classifier()
    clss.set_themes(themes)

    for course in courses:
        clss.set_description(course.description)
        try:
            predicted_themes = clss.classify()
        except BaseException:
            predicted_themes = []
        if commit:
            if object_session(course) is None:
                raise ArgumentError("Course object not part of session")
            course.themes.extend(predicted_themes)
            db.session.commit()
    return True


# Given a theme (by its id) returns a list of courses that are associated with it.
def find_courses(theme_id: int) -> list[Course]:
    return Course.query.filter(Course.themes.any(Theme.id == theme_id)).all()


# Given a theme (by its id) returns a list of programs that are associated with it.
def find_programs(theme_id: int) -> list[Program]:
    return Program.query.filter(Program.themes.any(Theme.id == theme_id)).all()


# Given a course id and program id, returns a set of themes that they have in common
def find_common_themes(course_id: int, program_id: int):
    course: Course = Course.query.get_or_404(course_id)
    program: Program = Program.query.get_or_404(program_id)

    return [t for t in course.themes if t.id in [i.id for i in program.themes]]


# Returns a set of Program objects, where each Program contains every specified theme.
def search_programs_by_themes(themes: list[int]) -> list[Program]:
    # Subquery to find programs with the specified theme_ids using the Progam_to_Theme association table
    subquery = (
        db.session.query(Program_to_Theme.c.program_id)
        .filter(Program_to_Theme.c.theme_id.in_(themes))
        .group_by(Program_to_Theme.c.program_id)
        .having(func.count() == len(themes))
        .subquery()
    )

    # Query for programs that match the subquery
    programs = db.session.query(Program).filter(Program.id.in_(subquery)).all()
    return programs


# Returns a set of Program objects, where each Program contains every specified theme.
def search_courses_by_themes(themes: list[int]) -> list[Program]:
    # Subquery to find programs with the specified theme_ids using the Progam_to_Theme association table
    subquery = (
        db.session.query(Course_to_Theme.c.course_id)
        .filter(Course_to_Theme.c.theme_id.in_(themes))
        .group_by(Course_to_Theme.c.course_id)
        .having(func.count() == len(themes))
        .subquery()
    )

    # Query for programs that match the subquery
    courses = db.session.query(Course).filter(Course.id.in_(subquery)).all()
    return courses


def related_courses(programid: int, common_count: int = 5, page=5, count=5):
    # Retrieve the Program by the given program ID
    program: Program = prog_dao.get_by_id(programid)

    # If the program does not exist, raise a NotFound exception
    if not program:
        raise NotFound("Program not found")

    # Create a subquery to count common themes per course related to the program
    common_courses_query = (
        db.session.query(
            Course.id, func.count(Course_to_Theme.c.theme_id).label("common_count")
        )
        .join(Course_to_Theme, Course.id == Course_to_Theme.c.course_id)
        .filter(Course_to_Theme.c.theme_id.in_([theme.id for theme in program.themes]))
        .group_by(Course.id)
        .subquery()
    )

    # Query to fetch related courses having at least a number of common themes specified by common_count
    courses = (
        db.session.query(Course)
        .join(common_courses_query, Course.id == common_courses_query.c.id)
        .filter(common_courses_query.c.common_count >= common_count)
        .order_by(common_courses_query.c.common_count.desc())
        .paginate(page=page, per_page=count)
        .items
    )

    return courses
