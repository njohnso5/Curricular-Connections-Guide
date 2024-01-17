from Data_model.models import db, Faculty
from flask import current_app

# Retrieve every faculty from the db
def get_all() -> list[Faculty] or None:
    
    return Faculty.query.all()
    
# Retrieve a faculty by its id
def get_by_id(id : int) -> Faculty or None:
    
    
    return Faculty.query.get(id)

# Insert a new Faculty into the db. Returns True if successful, False otherwise.
def insert_faculty(faculty : Faculty) -> bool:
    
        db.session.add(faculty)
        db.session.commit()
        return True
        
def insert_many(faculty : list[Faculty]) -> bool:
        
        db.session.add_all(faculty)
        db.session.commit()
        return True

# Updates a faculty in the db. Searches for a Faculty with a matching id to ensure it already exists in the db
def update_faculty(faculty : Faculty) -> bool:
    
    saved_faculty = get_by_id(faculty.id)
    
    if saved_faculty is None:
        return False
    
    db.session.merge(faculty)
    db.session.commit()
    
    return True
    
    
# Removes a faculty from the db by its id
def delete_faculty(faculty : Faculty) -> bool:
    cnt = Faculty.query.filter(Faculty.id==faculty.id).delete()
    if cnt == 1:
        db.session.commit()
        return True
    return False    
    
def get_faculty_by_name(expression : bool) -> list[Faculty]: 
    
    return Faculty.query.filter(expression).first()  
    
    