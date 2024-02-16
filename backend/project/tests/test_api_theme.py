from flask import Flask
from flask.testing import FlaskClient
from schemas import ThemeSchema
import json

THEME_BASE_URL = "v1/themes"

def test_post(client: FlaskClient, app: Flask):
    response = client.post("/v1/administrators/", json=json.loads('{"unity_id":"test", "role_id":"1"}'))
    assert response.status.code == 200

    response = client.post("/v1/themes/", data={ "name": "Test" })
    assert response.status.code == 200