from Data_model.models import db, Course, Semester
from flask import current_app
from sqlalchemy import select

# Retrieve every course from the db
def get_all() -> list[Course] or None:
    
    return Course.query.all()
    
    
# Retrieve a course by its id
def get_by_id(id : int) -> Course or None:
    
    
    return Course.query.get(id)
  
def get_semester_courses_as_page(id : int, page : int, count : int) -> list[Course]:
    Semester.query.get_or_404(id)
    
    # result = db.paginate(select(Course).filter(Course.semester_id==id), per_page=count, page=page)
    results = Course.query.filter(Course.semester_id==id).paginate(per_page=count, page=page)

    return results.items

# Insert a new Course into the db. Returns True if successful, False otherwise.
def insert_course(course : Course) -> bool:
    
        db.session.add(course)
        db.session.commit()
        return True
        
def insert_many(courses : list[Course]) -> bool:
        
        db.session.add_all(courses)
        db.session.commit()
        return True

# Updates a Course in the db. Searches for a Crogram with a matching id to ensure it already exists in the db
def update_course(course : Course) -> bool:
    
    saved_course = get_by_id(course.id)
    
    if saved_course is None:
        return False
    
    db.session.merge(course)
    db.session.commit()
    
    return True
    
    
# Removes a course from the db by its id
def delete_course(course : Course) -> bool:
    cnt = Course.query.filter(Course.id==course.id).delete()
    if cnt == 1:
        db.session.commit()
        return True
    return False    
    
    