from flask import Flask
import pytest
from app import create_app, db 


@pytest.fixture()
def app():
    app = create_app("sqlite:///:memory:")

    with app.app_context():
        db.create_all()

    yield app
    
@pytest.fixture()
def client(app: Flask):
    return app.test_client()