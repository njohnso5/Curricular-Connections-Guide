from flask import Flask
from flask.testing import FlaskClient
from schemas import CourseSchema
from Data_model.models import  RoleEnum
import json

PERIOD_BASE_URL = "/v1/courses/"


def test_post(client: FlaskClient, app: Flask):
    # Create Admin and Semester
    response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))

    assert response.status_code == 200

    response = client.post("/v1/semesters/", data={"year": "2022", "period_id": "1", "active": "true"})

    assert response.status_code == 200

    # Create Sample Courses
    response = client.post("/v1/courses/", data={ "title_short": "Automata Theory", "title_long": "Automata Theory Long", "description": "Nothing Much wbu?", "subject": "CSC", "catalog_number": "333", "faculty": "prof", "emails": "p@ncsu.edu", "semester_id": "1"})

    assert response.status_code == 200

    assert response.json['id'] == 1
    assert response.json['title_short'] == "Automata Theory"
    assert response.json['title_long'] == "Automata Theory Long"
    assert response.json['description'] == "Nothing Much wbu?"
    assert response.json['subject']['subject'] == "CSC"
    assert response.json['catalog_number'] == "333"
    assert response.json['semester_id'] == 1

def test_get(client: FlaskClient, app: Flask):
    # Create Admin and Semester
    response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))

    assert response.status_code == 200
    response = client.post("/v1/semesters/", data={ "year": 2022, "active": True, "period_id": 1})
    assert response.status_code == 200

    # Create Sample Courses
    response = client.post(PERIOD_BASE_URL, data={ "title_short": "Automata Theory", "title_long": "Automata Theory Long", "description": "Nothing Much wbu?", "subject": "CSC", "catalog_number": "333", "faculty": "prof", "emails": "p@ncsu.edu", "semester_id": "1"})

    assert response.status_code == 200
    
    response = client.get(PERIOD_BASE_URL)

    assert response.status_code == 200


    assert response.json[0]['id'] == 1
    assert response.json[0]['title_short'] == "Automata Theory"
    assert response.json[0]['title_long'] == "Automata Theory Long"
    assert response.json[0]['description'] == "Nothing Much wbu?"
    assert response.json[0]['subject']['subject'] == "CSC"
    assert response.json[0]['catalog_number'] == "333"
    assert response.json[0]['semester_id'] == 1






        
        
        


    
