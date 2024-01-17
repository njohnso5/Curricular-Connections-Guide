from flask import Flask
from flask.testing import FlaskClient
import json
from Data_model.models import Program, db, Department, Showing
from datetime import datetime
from dataclasses import asdict

BASE_URL = "/v1/showing/"


def test_get(client: FlaskClient):
    res = client.get(BASE_URL)

    assert res.status_code == 200
    assert isinstance(res.json, list)
    assert len(res.json) == 0

    add_program(client)

    res = client.get(BASE_URL)

    assert res.status_code == 200
    assert isinstance(res.json, list)
    assert len(res.json) == 2


def test_post(client: FlaskClient):
    res = client.post(BASE_URL)

    assert res.status_code == 418


def test_get_id(client: FlaskClient):
    res = client.get(BASE_URL + "1/")
    assert res.status_code == 404

    add_program(client)

    res = client.get(BASE_URL + "1/")
    assert res.status_code == 200
    assert isinstance(res.json, dict)
    assert res.json["location"] == "THeater place"


def test_delete(client: FlaskClient):
    res = client.delete(BASE_URL + "1/")
    assert res.status_code == 404
    add_program(client)
    
    res = client.get(BASE_URL + "1/")
    assert res.status_code == 200
    assert isinstance(res.json, dict)
    assert res.json["location"] == "THeater place"

    
    res = client.delete(BASE_URL + "1/")
    assert res.status_code == 200
    
    
    res = client.get(BASE_URL + "1/")
    assert res.status_code == 404

def add_program(client):
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
