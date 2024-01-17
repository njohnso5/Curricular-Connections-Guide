import unittest
from flask import Flask
from flask.testing import FlaskClient
import pytest
from schemas import CourseSchema
from Data_model.models import db, RoleEnum, Role, Administrator
import json
from schemas import AdministratorsSchema

class AdministratorAPITest(unittest.TestCase):

    ADMINISTRATOR_BASE_URL = "/v1/administrators/"

    @pytest.fixture(autouse=True)
    def setup_and_teardown(self, client: FlaskClient, app: Flask):
        self.client = client
        self.app = app

    def setUp(self):
        roles = [Role(role=role) for role in RoleEnum]

        with self.app.app_context():
            db.session.add_all(roles)
            db.session.commit()

    def tearDown(self):
        pass

    def test_post(self):
        with self.app.app_context():
            response = self.client.post(self.ADMINISTRATOR_BASE_URL, json=json.loads('{ "unity_id": "msabrams", "role_id": 1 }'))
            assert response.status_code == 200

            administrator = json.loads(response.data.decode('utf-8'))

            assert administrator["unity_id"] == "msabrams"
            assert administrator["role"]["role"] == "SUPERUSER"

    def test_get(self):
        pass




        
        
        


    
