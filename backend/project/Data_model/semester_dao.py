from Data_model.models import Semester, db
from flask import current_app
from sqlalchemy.sql.elements import BinaryExpression


# Retrieve every Semester and its courses from the db
def get_all() -> list[Semester] or None:
    
    return Semester.query.all()

def get_active() -> Semester or None:
     semester = Semester.query.filter(Semester.active == 1).first()
     print("Active found: ")
     print(semester)
     return semester
    
# Retrieve every Semester that fits filter from the db
def get_by_filter(expression : BinaryExpression) -> list[Semester] or None:
    return Semester.query.filter(expression).all()    

# Retrieve a Semester by its id
def get_by_id(id : int) -> Semester or None:
    
    return Semester.query.get_or_404(id, description="No semester found with the given ID.")

# Insert a new Semester into the db. Returns True if successful, False otherwise.
def insert_semester(semester : Semester) -> bool:
    
        # Probably should add some sort of error checking here
        db.session.add(semester)
        db.session.commit()
        return True

# Updates a semester in the db. Searches for a Semester with a matching id to ensure it already exists in the db
def update_semester(semester : Semester) -> bool:
    
    saved_semester = get_by_id(semester.id)
    
    if saved_semester is None:
        return False
    
    print('program_dao Saved Semester: ' + str(saved_semester.year))
    # print('Current Semester: ' + str(semester.active))

    db.session.merge(semester)
    db.session.commit()

    print('New Semester: ' + str(Semester.query.get_or_404(semester.id).year))
    
    return True
    
# Removes a semester from the db by its id
def delete_semester(semester : Semester):
    semester = Semester.query.get_or_404(semester.id)

    db.session.delete(semester)
    db.session.commit() 
    