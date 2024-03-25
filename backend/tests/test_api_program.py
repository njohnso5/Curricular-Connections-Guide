from flask import Flask
from flask.testing import FlaskClient
import json
from Data_model.models import Program, db, Department, Showing
from datetime import datetime
from dataclasses import asdict
from schemas import ProgramSchema

BASE_URL = "/v1/program/"


def test_get(client: FlaskClient):
    resp = client.get(BASE_URL)
    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    assert len(resp.get_json()) == 0

    p1 = Program()
    p1.department = str(Department.LIVE.value)
    p1.link = ""
    p1.title = "Something"
    p1.description = "This is a test program"
    p1.showings = []
    with client.application.app_context():
        db.session.add(p1)
        db.session.commit()

    resp = client.get(BASE_URL)

    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    assert len(resp.get_json()) == 1


def test_get_past(client: FlaskClient):
    p1 = Program()
    p1.department = str(Department.LIVE.value)
    p1.link = ""
    p1.title = "Something"
    p1.description = "This is a test program"
    p1.showings = []

    with client.application.app_context():
        db.session.add(p1)
        db.session.commit()

    resp = client.get(BASE_URL, query_string={"display": "past"})

    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    assert len(resp.get_json()) == 0

    show1 = Showing(
        datetime=(datetime.strptime("25/05/22 02:35:5.523", "%d/%m/%y %H:%M:%S.%f")),
        price="5",
        location="THeater place",
    )

    with client.application.app_context():
        p = Program.query.get(1)

        p.showings.append(show1)
        db.session.merge(p)
        db.session.commit()

    resp = client.get(BASE_URL, query_string={"display": "past"})

    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    assert len(resp.get_json()) == 1


def test_get_upcoming(client: FlaskClient):
    p1 = Program()
    p1.department = str(Department.LIVE.value)
    p1.link = ""
    p1.title = "Something"
    p1.description = "This is a test program"
    p1.showings = []
    with client.application.app_context():
        db.session.add(p1)
        db.session.commit()

    resp = client.get(BASE_URL, query_string={"display": "past"})

    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    assert len(resp.get_json()) == 0

    show1 = Showing(
        datetime=(datetime.strptime("25/05/24 02:35:5.523", "%d/%m/%y %H:%M:%S.%f")),
        price="5",
        location="THeater place",
    )

    with client.application.app_context():
        p = Program.query.get(1)
        p.showings.append(show1)
        db.session.merge(p)
        db.session.commit()

    resp = client.get(BASE_URL, query_string={"display": "upcoming"})

    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    assert len(resp.get_json()) == 1


def test_get_id(client: FlaskClient):
    resp = client.get(BASE_URL + "1/")

    assert resp.status_code == 404

    p1 = Program()
    p1.department = str(Department.LIVE.value)
    p1.link = ""
    p1.title = "Something"
    p1.description = "This is a test program"
    p1.showings = []
    with client.application.app_context():
        db.session.add(p1)
        db.session.commit()

    resp = client.get(BASE_URL + "1/")

    assert resp.status_code == 200
    assert isinstance(resp.get_json(), dict)
    assert resp.get_json()["department"] == str(Department.LIVE.value)
    assert resp.get_json()["title"] == "Something"


def test_get_departments(client: FlaskClient):
    resp = client.get(BASE_URL + "departments/")

    assert resp.status_code == 200
    assert isinstance(resp.get_json()["departments"], list)
    assert len(Department)


def test_post(client: FlaskClient):
    response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))
    assert response.status_code == 200
    get = client.get(BASE_URL)
    assert get.status_code == 200
    assert len(get.json) == 0

    p1 = {}
    p1["department"] = str(Department.LIVE.value)
    p1["link"] = ""
    p1["title"] = "Something"
    p1["description"] = "This is a test program"
    p1["showings"] = '{}'

    resp = client.post(
        BASE_URL, data=p1, content_type="multipart/form-data"
    )

    assert resp.status_code == 200
    assert isinstance(resp.json, dict)
    assert resp.json["id"] == 1

    get = client.get(BASE_URL)
    assert get.status_code == 200
    assert len(get.json) == 1


def test_post_invalid(client: FlaskClient):
    response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))
    assert response.status_code == 200
    p1 = {}
    p1["department"] = str(Department.LIVE.value)
    p1["link"] = ""
    p1["title"] = "Something"
    p1["description"] = None
    p1["showings"] = []

    resp = client.post(
        BASE_URL, data=json.dumps(p1), content_type="application/json"
    )

    assert resp.status_code == 422

    p1 = {}
    p1["department"] = str(Department.LIVE.value)
    p1["link"] = ""
    p1["title"] = "Something"
    p1["description"] = None
    p1["showings"] = []

    resp = client.post(
        BASE_URL, data=json.dumps(p1), content_type="application/json"
    )

    assert resp.status_code == 422


def test_delete(client: FlaskClient):
    response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))
    assert response.status_code == 200
    p1 = {}
    p1["department"] = str(Department.LIVE.value)
    p1["link"] = ""
    p1["title"] = "Something"
    p1["description"] = "This is a test program"
    p1["showings"] = '{}'

    resp = client.post(
        BASE_URL, data=p1, content_type="multipart/form-data"
    )

    assert resp.status_code == 200
    assert isinstance(resp.json, dict)
    assert resp.json["id"] == 1

    get = client.get(BASE_URL)
    assert get.status_code == 200
    assert len(get.json) == 1

    delete = client.delete(BASE_URL + "1/")

    assert delete.status_code == 200

    get = client.get(BASE_URL)
    assert get.status_code == 200
    assert len(get.json) == 0


def test_put(client: FlaskClient):
    response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))
    assert response.status_code == 200
    resp = client.get(BASE_URL)
    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    assert len(resp.get_json()) == 0

    p1 = Program()
    p1.department = str(Department.LIVE.value)
    p1.link = ""
    p1.title = "Something"
    p1.description = "This is a test program"
    p1.showings = []
    with client.application.app_context():
        db.session.add(p1)
        db.session.commit()

    resp = client.get(BASE_URL)

    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    assert len(resp.get_json()) == 1
    p2 = {}
    p2["id"] = int(resp.json[0]['id'])
    p2["department"] = str(Department.LIVE.value)
    p2["link"] = ""
    p2["title"] = "Something"
    p2["description"] = "This is an edited test program"
    p2["showings"] = '{}'
    put = client.put(BASE_URL, data=p2, content_type="multipart/form-data")

    assert put.status_code == 200
    assert put.json["description"] == "This is an edited test program"
    
def test_put_showings(client : FlaskClient):
    response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))
    assert response.status_code == 200
    p1 = Program()
    p1.department = str(Department.LIVE.value)
    p1.link = ""
    p1.title = "Something"
    p1.description = "This is a test program"
    p1.showings = []
    show1 = Showing(
        datetime=(datetime.strptime("25/05/24 02:35:5.523", "%d/%m/%y %H:%M:%S.%f")),
        price="5",
        location="THeater place",
    )
    
    
    show2 = Showing(
        datetime=(datetime.strptime("25/05/22 02:35:5.523", "%d/%m/%y %H:%M:%S.%f")),
        price="5",
        location="THeater placey place",
    )
    
    p1.showings.append(show1)
    p1.showings.append(show2)
    
    with client.application.app_context():
        db.session.add(p1)
        db.session.commit()
    showing1 = {"id": "1", "datetime":(datetime.strptime("25/05/24 02:35:5.523", "%d/%m/%y %H:%M:%S.%f")).strftime("%d/%m/%y %H:%M:%S.%f"), "price":"10", "location":"THeater place"}
    showing2 = {"id": "2","datetime":(datetime.strptime("25/05/22 02:35:5.523", "%d/%m/%y %H:%M:%S.%f")).strftime("%d/%m/%y %H:%M:%S.%f"), "price":"5", "location":"THeater placey place"}
    showing3 = {"id": "3","datetime":(datetime.strptime("25/05/22 02:35:5.523", "%d/%m/%y %H:%M:%S.%f")).strftime("%d/%m/%y %H:%M:%S.%f"), "price":"5", "location":"THeater placey place"}
    showingList = json.dumps([showing1, showing2, showing3])
    program = {"id": 1, "department": str(Department.LIVE.value), "link": "", "title": "Something", "showings": showingList, "description": "This is an edited test program"}

    resp = client.put(
        BASE_URL, data=program, content_type="multipart/form-data"
    )
    assert resp.status_code == 200

def test_image(client : FlaskClient):
    response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))
    assert response.status_code == 200
    p1 = {"department": str(Department.LIVE.value), "link":"test", "title":"Something", "description":"This is a test program History", "image": open("tests/test_image.jpeg" ,"rb"),"showings":'{}'}

    response = client.post(BASE_URL, data=p1, content_type="multipart/form-data")
    assert response.status_code == 200
    progid = str(response.json['id'])
    print(response.json)
    response = client.get(BASE_URL + progid + "/image/")
    assert response.status_code == 200

def test_search(client : FlaskClient):
    response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))
    assert response.status_code == 200
    p1 = {"department": str(Department.LIVE.value), "link":"test", "title":"Something", "description":"This is a test program History", "showings":'{}'}

    response = client.post(BASE_URL, data=p1, content_type="multipart/form-data")
    assert response.status_code == 200
    search = {}
    search["themes"] = ["History"]
    search["departments"] = ""
    search["title"] = "Something"
    search["dates"] = []
    search["searchByRange"] = False
    response = client.post("/v1/search/", json=search)
    assert response.status_code == 200

# def test_related_course(client : FlaskClient):
#     response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))
#     assert response.status_code == 200

#     response = client.post("/v1/semesters/", data={"year": "2022", "period_id": "1", "active": "true"})

#     assert response.status_code == 200

#     # Create Sample Courses
#     response = client.post("/v1/courses/", data={ "title_short": "Automata Theory", "title_long": "Automata Theory Long", "description": "History Nothing Much wbu?", "subject": "CSC", "catalog_number": "333","topics_description":"test", "faculty": "prof", "emails": "p@ncsu.edu", "semester_id": "1"})

#     assert response.status_code == 200
#     print(response.json)

#     p1 = {}
#     p1["department"] = str(Department.LIVE.value)
#     p1["link"] = ""
#     p1["title"] = "Something"
#     p1["description"] = "This is a test program History"
#     p1["showings"] = '{}'

#     response = client.post(BASE_URL, data=p1, content_type="multipart/form-data")
#     assert response.status_code == 200
#     progid = response.json['id']
#     response = client.get(BASE_URL + str(progid) + "/courses/")
#     assert response.status_code == 200
#     assert response.json['title_short'] == "Automata Theory"