from flask import Flask
from flask.testing import FlaskClient
from schemas import CourseSchema
import json

PERIOD_BASE_URL = "/v1/courses/"

def test_post(client: FlaskClient, app: Flask):

    # Create Semester
    response = client.post("/v1/semesters/", json=json.loads('{ "year": 2022, "active": true, "period_id": 1}'))
    assert response.status_code == 200

    # Create Sample Courses
    response = client.post("/v1/courses/", json=json.loads('{ "title_short": "Automata Theory", "title_long": "Automata Theory Long", "description": "Nothing Much wbu?", "subject_id": 1, "catalog_number": 333, "semester_id": 1}'))

    assert response.status_code == 200
    
    course_data = CourseSchema().load(response.get_json())

    assert course_data['id'] == 1
    assert course_data['title_short'] == "Automata Theory"
    assert course_data['title_long'] == "Automata Theory Long"
    assert course_data['description'] == "Nothing Much wbu?"
    assert course_data['subject_id'] == 1
    assert course_data['catalog_number'] == 333
    assert course_data['semester_id'] == 1

def test_get(client: FlaskClient, app: Flask):

    # Create Semester
    response = client.post("/v1/semesters/", json=json.loads('{ "year": 2022, "active": true, "period_id": 1}'))
    assert response.status_code == 200

    # Create Sample Courses
    response = client.post(PERIOD_BASE_URL, json=json.loads('{ "title_short": "Automata Theory", "title_long": "Automata Theory Long", "description": "Nothing Much wbu?", "subject_id": 1, "catalog_number": 333, "semester_id": 1}'))

    assert response.status_code == 200
    
    response = client.get(PERIOD_BASE_URL)

    assert response.status_code == 200

    course_data = CourseSchema(many=True).load(response.json)

    assert type(course_data) == list
    
    assert course_data[0]['id'] == 1
    assert course_data[0]['title_short'] == "Automata Theory"
    assert course_data[0]['title_long'] == "Automata Theory Long"
    assert course_data[0]['description'] == "Nothing Much wbu?"
    assert course_data[0]['subject_id'] == 1
    assert course_data[0]['catalog_number'] == 333
    assert course_data[0]['semester_id'] == 1






        
        
        


    
