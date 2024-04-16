from flask import Flask
from flask.testing import FlaskClient
from schemas import ThemeSchema
import json

THEME_BASE_URL = "v1/themes"

def test_post(client: FlaskClient, app: Flask):

    response = client.post("/v1/themes/", data={ "name": "Test" })
    assert response.status_code == 200

def test_delete(client: FlaskClient, app: Flask):
    #add a theme
    response = client.post("/v1/themes/", data={ "name": "Test" })
    assert response.status_code == 200
    #delete that theme
    response = client.delete("/v1/themes/1/")
    assert response.status_code == 200
