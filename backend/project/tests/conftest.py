from flask import Flask, request
from flask.testing import FlaskClient
import pytest
import sys

sys.path.append(".") # Adds higher directory to python modules path.
from Data_model.models import db, RoleEnum, Role, Administrator
from app import create_app, db 
# docker exec -it <container_name_or_id> bash



@pytest.fixture()
def app():
    roles = [Role(role=role) for role in RoleEnum]
    app = create_app("sqlite:///:memory:")
    with app.app_context():
        db.create_all()
        db.session.add_all(roles)
        db.session.commit()
    

    yield app
    
@pytest.fixture()
def client(app: Flask):
    app.testing = True
    return app.test_client()