from Data_model.models import db, Subject
from flask import current_app


def get_all() -> list[Subject] or None:
    
    return Subject.query.all()
    
def get_by_id(id : int) -> Subject or None:
    return Subject.query.get_or_404(id, description="No subject found with the given ID.")

def insert(subject : Subject):
    
    # ADD Validation checks here
    
    db.session.add(subject)
    db.session.commit()
    
def delete(id : int) -> bool:
    
        subject: Subject = Subject.query.get_or_404(id)
        
        subject.query.delete()
        db.session.commit()
        return True

def get_subject_by_name(expression : bool) -> list[Subject]: 
    
    return Subject.query.filter(expression).first()  