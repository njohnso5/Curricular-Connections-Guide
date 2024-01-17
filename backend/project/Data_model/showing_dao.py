from Data_model.models import Program, db, Showing, Department
import Data_model.program_dao as prog_dao
from flask import current_app
from datetime import datetime
from sqlalchemy.sql.elements import BinaryExpression
from dateutil import parser

# Function to retrieve all showings from the database
def get_all() -> list[Showing] or None:
    return Showing.query.all()

# Function to retrieve a showing by its ID from the database
def get_by_id(id: int) -> Showing or None:
    return Showing.query.get_or_404(
        id, description="No showing found with the given ID."
    )

# Function to insert a new showing into the database
def insert(show: Showing):
    db.session.add(show)
    db.session.commit()

# Function to update an existing showing in the database
def update(show: dict, id: int):
    # Parse the datetime string in the show dictionary
    show["datetime"] = parser.parse(show["datetime"])

    # Update the showing with the provided dictionary
    Showing.query.filter(Showing.id == id).update(show)

    # Commit the changes to the database
    db.session.commit()

# Function to delete a showing from the database by its ID
def delete(id: int) -> bool:
    # Get the showing by its ID or raise a 404 error if not found
    showing: Showing = Showing.query.get_or_404(id)

    # Delete the showing from the database
    showing.query.filter(Showing.id == id).delete()
    
    # Commit the changes to the database
    db.session.commit()
    
    # Return True to indicate successful deletion
    return True

# Function to retrieve showings based on a datetime expression
def get_showing_by_datetime_expression(expression: BinaryExpression) -> list[Showing]:
    return Showing.query.filter(expression).all()

# Function to associate a showing with a program in the database
def add_show_to_program(show: Showing, programid: int):
    # Retrieve the program by its ID
    program = prog_dao.get_by_id(programid)

    # Append the showing to the program's list of showings
    program.showings.append(show)

    # Commit the changes to the database
    db.session.commit()
