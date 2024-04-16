from Data_model.models import UserLog, db

from sqlalchemy.exc import SQLAlchemyError
# Retrieve every User log from the db
def get_all() -> list[UserLog] or None:
    
    return UserLog.query.all()

#insert an User log into the db

def insert(log: UserLog):
    try:
        db.session.add(log)
        db.session.commit()
    except SQLAlchemyError as e:
        print(f"Error inserting log: {e}")
        db.session.rollback()
