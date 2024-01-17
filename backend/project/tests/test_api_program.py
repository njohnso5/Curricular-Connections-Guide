from flask import Flask
from flask.testing import FlaskClient
import json
from Data_model.models import Program, db, Department, Showing
from datetime import datetime
from dataclasses import asdict

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
    get = client.get(BASE_URL)
    assert get.status_code == 200
    assert len(get.json) == 0

    p1 = {}
    p1["department"] = str(Department.LIVE.value)
    p1["link"] = ""
    p1["title"] = "Something"
    p1["description"] = "This is a test program"
    p1["showings"] = []

    resp = client.post(
        BASE_URL, data=json.dumps(p1), content_type="application/json"
    )

    assert resp.status_code == 200
    assert isinstance(resp.json, dict)
    assert resp.json["id"] == 1

    get = client.get(BASE_URL)
    assert get.status_code == 200
    assert len(get.json) == 1


def test_post_invalid(client: FlaskClient):
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
    p1 = {}
    p1["department"] = str(Department.LIVE.value)
    p1["link"] = ""
    p1["title"] = "Something"
    p1["description"] = "This is a test program"
    p1["showings"] = []

    resp = client.post(
        BASE_URL, data=json.dumps(p1), content_type="application/json"
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

    program = {"id": 1, "department": str(Department.LIVE.value), "link": "", "title": "Something", "showings": [], "description": "This is an edited test program"}

    put = client.put(
        BASE_URL + "1/", data=json.dumps(program), content_type="application/json"
    )

    assert put.status_code == 200
    assert put.json["description"] == "This is an edited test program"
    
def test_put_showings(client : FlaskClient):
    
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

    showing1 = {"id":1,"datetime":(datetime.strptime("25/05/24 02:35:5.523", "%d/%m/%y %H:%M:%S.%f")).strftime("%d/%m/%y %H:%M:%S.%f"), "price":"10", "location":"THeater place", "state": "modified"}
    showing2 = {"datetime":(datetime.strptime("25/05/22 02:35:5.523", "%d/%m/%y %H:%M:%S.%f")).strftime("%d/%m/%y %H:%M:%S.%f"), "price":"5", "location":"THeater placey place"}
    showing3 = {"datetime":(datetime.strptime("25/05/22 02:35:5.523", "%d/%m/%y %H:%M:%S.%f")).strftime("%d/%m/%y %H:%M:%S.%f"), "price":"5", "location":"THeater placey place", "state" : "new"}

    program = {"id": 1, "department": str(Department.LIVE.value), "link": "", "title": "Something", "showings": [showing1, showing2, showing3], "description": "This is an edited test program"}
    

    resp = client.put(
        BASE_URL + "1/", data=json.dumps(program), content_type="application/json"
    )
    
    assert resp.status_code == 200
    assert len(resp.json["showings"]) == 3
    assert resp.json["showings"][0]["price"] == '10'