from Data_model.models import Role

def get_roles() -> list[Role]:
    return Role.query.all()
