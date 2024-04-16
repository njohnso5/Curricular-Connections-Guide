from Data_model.models import AdminLog, db

# Retrieve every Admin log from the db
def get_all() -> list[AdminLog] or None:
    
    return AdminLog.query.all()

#insert an Admin log into the db
def insert(log: AdminLog):
    db.session.add(log)
    db.session.commit()
    return True