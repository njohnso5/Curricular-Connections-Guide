from flask_principal import Permission, RoleNeed
from Data_model.models import RoleEnum
from functools import wraps

superuser_permission = Permission(RoleNeed(RoleEnum.SUPERUSER))
admin_permission = Permission(RoleNeed(RoleEnum.ADMIN))
ccg_permission = Permission(RoleNeed(RoleEnum.CCG))
viewer_permission = Permission(RoleNeed(RoleEnum.VIEWER))
authenticated_permission = Permission(*[RoleNeed(role) for role in RoleEnum if role != RoleEnum.UNAUTHORIZED])

def require_roles(roles : list[RoleEnum]) -> Permission:
    return Permission(*[RoleNeed(r) for r in set(roles)])