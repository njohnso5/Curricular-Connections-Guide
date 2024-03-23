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
    response = client.post("/v1/semesters/", data={ "year": 2023, "active": "true", "period_id": 1})
    assert response.status_code == 200

    # Get semester from database
    response = client.get(SEMESTER_BASE_URL)
    assert response.status_code == 200
    
    # Check fields of semester
    semester_data = SemesterSchema(many=True).load(response.json)
    
    assert type(semester_data) == list
    


    s1 = Semester()
    s1.year = "2023"
    s1.period_id= 1
    
# def test_course_upload
def test_course_upload(client: FlaskClient, app: Flask):
    catalog = open('tests/test_new.csv', 'rb')
    #print(catalog)
    #add semester with a course catalog
    response = client.post("/v1/semesters/", data={ "year": 2023, "active": "true", "period_id": 1, "catalog": (catalog, 'test_new.csv')}, content_type='multipart/form-data')
    assert response.status_code == 200
    resp = client.get(SEMESTER_BASE_URL)
    #check to see that it got added and there is only one semester in the db
    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    assert len(resp.get_json()) == 1
    #get the courses from the semester id
    semesterId = str(resp.json[0]["id"])
    resp = client.get("/v1/semesters/" + semesterId + "/courses/")
    assert response.status_code == 200
    #check to see that two courses were added
    assert len(resp.get_json()) == 2
    #check to see that the courses were added successfully
    assert resp.json[0]['subject']['subject'] == "ACC"
    assert resp.json[0]['title_short'] == "Concepts Fin Repor"
    assert resp.json[0]['catalog_number'] == "210"
    assert resp.json[1]['subject']['subject'] == "ACC"
    assert resp.json[1]['title_short'] == "Intro to Mgrl Accounting"
    assert resp.json[1]['catalog_number'] == "220"



