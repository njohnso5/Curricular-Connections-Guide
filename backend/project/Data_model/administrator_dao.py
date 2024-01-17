from Data_model.models import db, Administrator, Role, RoleEnum
from sqlalchemy.exc import SQLAlchemyError

def get_administrators() -> list[Administrator]:
    return Administrator.query.join(Role).filter(Role.role != RoleEnum.UNAUTHORIZED).all()

def get_administrator(id: int) -> Administrator:
    return Administrator.query.get_or_404(id)

def update_administrator(id, role_data: dict) -> Administrator:
    administrator = get_administrator(id)
    administrator.role_id = role_data.get("id", administrator.role_id)

    try:
        db.session.add(administrator)
        db.session.commit()
        return administrator
    except SQLAlchemyError as error:
        raise error
    
def delete_administrator(id) -> None:
    try:
        db.session.delete(get_administrator(id))
        db.session.commit()
    except SQLAlchemyError as error:
        raise error

def create_administrator(administrator_data) -> Administrator:
    administrator = Administrator(**administrator_data)

    try:
        db.session.add(administrator)
        db.session.commit()
    except SQLAlchemyError as error:
        raise error
    
    return administrator

