from flask import Flask
from flask.testing import FlaskClient
from schemas import CourseSchema
from Data_model.models import  RoleEnum
import json

PERIOD_BASE_URL = "/v1/courses/"


def test_post(client: FlaskClient, app: Flask):
    # Create  Semester
    response = client.post("/v1/semesters/", data={"year": "2022", "period_id": "1", "active": "true"})

    assert response.status_code == 200

    # Create Sample Courses
    response = client.post("/v1/courses/", data={ "title_short": "Automata Theory", "title_long": "Automata Theory Long", "description": "Nothing Much wbu?", "subject": "CSC", "catalog_number": "333","topics_description":"test", "faculty": "prof", "emails": "p@ncsu.edu", "semester_id": "1"})

    assert response.status_code == 200

    assert response.json['id'] == 1
    assert response.json['title_short'] == "Automata Theory"
    assert response.json['title_long'] == "Automata Theory Long"
    assert response.json['description'] == "Nothing Much wbu?"
    assert response.json['subject']['subject'] == "CSC"
    assert response.json['catalog_number'] == "333"
    assert response.json['semester_id'] == 1

def test_get(client: FlaskClient, app: Flask):
    # Create  Semester

    response = client.post("/v1/semesters/", data={ "year": 2022, "active": True, "period_id": 1})
    assert response.status_code == 200

    # Create Sample Courses
    response = client.post(PERIOD_BASE_URL, data={ "title_short": "Automata Theory", "title_long": "Automata Theory Long", "description": "Nothing Much wbu?", "subject": "CSC", "catalog_number": "333","topics_description":"test", "faculty": "prof", "emails": "p@ncsu.edu", "semester_id": "1"})

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

def test_edit(client: FlaskClient, app: Flask):
    # Create  Semester

    response = client.post("/v1/semesters/", data={"year": "2022", "period_id": "1", "active": "true"})

    assert response.status_code == 200

    # Create Sample Courses
    response = client.post("/v1/courses/", data={ "title_short": "Automata Theory", "title_long": "Automata Theory Long", "description": "Nothing Much wbu?", "subject": "CSC", "catalog_number": "333","topics_description":"test", "faculty": "prof", "emails": "p@ncsu.edu", "semester_id": "1"})

    assert response.status_code == 200

    # edit the course
    response = client.put("/v1/courses/", data={"course_id":"1", "title_short": "edit Automata Theory", "title_long": "edit Automata Theory Long", "description": "edit Nothing Much wbu?", "subject": "CSC", "catalog_number": "333", "topics_description":"test", "faculty": "prof", "emails": "p@ncsu.edu", "semester_id": "1"})

    assert response.status_code == 200
    #get it and check to see that the update worked
    response = client.get(PERIOD_BASE_URL)
    print(response.json)
    assert response.json[0]['id'] == 1
    assert response.json[0]['title_short'] == "edit Automata Theory"
    assert response.json[0]['title_long'] == "edit Automata Theory Long"
    assert response.json[0]['description'] == "edit Nothing Much wbu?"
    #assert response.json[0]['topics_description'] == 'test'
    assert response.json[0]['subject']['subject'] == "CSC"
    assert response.json[0]['catalog_number'] == "333"
    assert response.json[0]['semester_id'] == 1

def test_delete(client: FlaskClient, app: Flask):
    # Create Semester

    response = client.post("/v1/semesters/", data={"year": "2022", "period_id": "1", "active": "true"})

    assert response.status_code == 200

    # Create Sample Courses
    response = client.post("/v1/courses/", data={ "title_short": "Automata Theory", "title_long": "Automata Theory Long", "description": "history Nothing Much wbu?", "subject": "CSC", "catalog_number": "333","topics_description":"test", "faculty": "prof", "emails": "p@ncsu.edu", "semester_id": "1"})

    assert response.status_code == 200
    # Delete Sample Courses
    response = client.delete("/v1/courses/delete/", json={ 'courseIds': [1]})

    assert response.status_code == 204

        
def test_edit_themes(client: FlaskClient, app: Flask):
    # Create Semester

    response = client.post("/v1/semesters/", data={"year": "2022", "period_id": "1", "active": "true"})

    assert response.status_code == 200

    # Create Sample Courses
    response = client.post("/v1/courses/", data={ "title_short": "Automata Theory", "title_long": "Automata Theory Long", "description": "history Nothing Much wbu?", "subject": "CSC", "catalog_number": "333","topics_description":"test", "faculty": "prof", "emails": "p@ncsu.edu", "semester_id": "1"})

    assert response.status_code == 200

    # Create Sample Themes
    response = client.post("/v1/themes/", data={ "name": "Test" })
    assert response.status_code == 200

    response = client.post("/v1/themes/", data={ "name": "Test2" })
    assert response.status_code == 200
    # Prepare the data for the PUT request
    put_data = json.dumps([{"id": 1, "name": "Test"}, {"id": 2, "name": "Test2"}])

    # Send a GET request to the server
    response = client.get("/v1/themes/course/1/")
    
    assert response.status_code == 200

    # Send a PUT request to the server
    response = client.put("/v1/themes/course/1/", data=put_data, content_type='application/json')

    # Check the response status code
    assert response.status_code == 200

    # Parse the response data
    response_data = json.loads(response.data.decode('utf-8'))

    # Check the response data
    assert response_data["success"] == "Themes updated"