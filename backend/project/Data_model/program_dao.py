# Import necessary modules and classes
from Data_model.models import Program, db, Showing, Program_to_Theme, Department, Theme
from sqlalchemy.sql.functions import func
from sqlalchemy import or_, BinaryExpression
from dateutil import parser
from werkzeug.exceptions import NotFound



# Retrieve all programs and their showings from the database
def get_all() -> list[Program] or None:
    return Program.query.all()


# Retrieve a program by its ID
def get_by_id(id: int) -> Program or None:
    program = db.session.query(Program).get(id)
    
    # If the program does not exist, raise a NotFound exception
    if not program:
        raise NotFound("Program not found")

    return program

# Search programs by title
def search_by_title(title: str) -> list[Program] | None:
    search_param = "%{}%".format(title)
    return db.session.query(Program).filter(Program.title.like(search_param)).all()


# Insert a new Program into the database
def insert(program: Program):
    db.session.add(program)
    db.session.commit()


# Update a program in the database based on its ID
# The first param must be a dictionary where each key is a field to be updated in the stored Program
def update(program: dict, id: int):
    Program.query.filter(Program.id == id).update(program)
    db.session.commit()

    return Program.query.get(id)


# Remove a program from the database by its ID
def delete(id: int) -> bool:
    Program.query.get_or_404(id)

    # Delete related showings
    Showing.query.filter(Showing.program_id == id).delete()

    # Delete Program_to_Theme relations
    db.session.query(Program_to_Theme).filter(
        Program_to_Theme.columns.program_id == id
    ).delete()

    # Delete the program
    Program.query.filter(Program.id == id).delete()
    db.session.commit()
    return True


def get_departments() -> list[str]:
    return [department.value for department in Department]

'''
Search programs based on various filter parameters
Params:
    title : str -> A string to search for similar titles (i.e. given "Lo" returns programs such as "Lord of the Rings" and "Lost Woods")
    themes : list[int] -> A list of theme ids that a desired program can have. A resulting program can have any 1 or all the themes in this list.
    dates : list[str] -> A list of datetime strings to search showings of a program. A given string specifies a date a potential showing will be on.
    departments : list[str] -> A list of strings as the departments of potential programs that are retrieved
Return Value:
    A list of the Programs that match the given search criteria
'''
def search(**kwargs) -> list[Program]:
    themes: list[str] = kwargs.get("themes") 
    title: str = kwargs.get("title")
    dates: list[str] = kwargs.get("dates")
    departments: str = kwargs.get("departments")
    searchByRange: bool = kwargs.get("searchByRange")
    filters: list[BinaryExpression[bool]] = [] # A list of SQLAlchemy filter expressions
    themes_subquery = None

    # Filter by themes if specified
    if themes:
        themes_subquery = (
            db.session.query(Program_to_Theme.c.program_id)
            .join(Theme, Program_to_Theme.c.theme_id==Theme.id)
            .filter(Theme.name.in_(themes))
            .group_by(Program_to_Theme.c.program_id)
            .distinct()
            .subquery()
        )
        filters.append(Program.id.in_(themes_subquery))

    # Filter by departments if specified
    if departments:
        filters.append(Program.department == departments)
    # Filter by dates if specified
    if dates:
        # If there are two dates, parse them into datetime objects and filter by the range
        if searchByRange:
            parsed_dates = [parser.parse(d).date() for d in dates]
            filters.append(
                Program.showings.any(
                    func.date(Showing.datetime).between(parsed_dates[0], parsed_dates[1])
                )
            )

        else:
            # Otherwise, parse the dates and filter by the list of dates
            parsed_dates = [parser.parse(d).date() for d in dates]

            # Only use year, month, and day in the showing of datetime to compare
            # This is because the time of the showing is not relevant to the search
            filters.append(
                Program.showings.any(
                    func.date(Showing.datetime).in_(parsed_dates)
                )
            )

    # Combine the filters to function as an OR statement in SQL
    crit_query = db.session.query(Program).filter(or_(*filters))

    # Further filter by title if specified
    # Operates as an AND SQL statement rather than the OR in previous filters
    if title:
        search_param = "%{}%".format(title)
        return crit_query.filter(Program.title.like(search_param)).all()

    return crit_query.all()

