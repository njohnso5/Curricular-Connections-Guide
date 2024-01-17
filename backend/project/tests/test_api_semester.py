from flask import Flask
from flask.testing import FlaskClient
from schemas import SemesterSchema
from Data_model.models import Semester
import json

SEMESTER_BASE_URL = "/v1/semesters/"

##ask michael what things i should test 


def test_get(client: FlaskClient, app: Flask):
    # Check that nothing is retrieved sucessfully
    resp = client.get(SEMESTER_BASE_URL)
    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    assert len(resp.get_json()) == 0
    
    # Add semester to database
    response = client.post("/v1/semesters/", json=json.loads('{ "year": 2023, "active": true, "period_id": 1}'))
    assert response.status_code == 200

    # Get semester from database
    response = client.get(SEMESTER_BASE_URL)
    assert response.status_code == 200
    
    # Check fields of semester
    semester_data = SemesterSchema(many=True).load(response.json)
    
    assert type(semester_data) == list
    


    s1 = Semester()
    s1.year = "2023"
    s1.period = 1
    
# def test_course_upload

