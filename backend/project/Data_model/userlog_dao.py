from Data_model.models import UserLog, db

# Retrieve every User log from the db
def get_all() -> list[UserLog] or None:
    
    return UserLog.query.all()

#insert an User log into the db
def insert(log: UserLog):
    db.session.add(log)
    db.session.commit()
    return True