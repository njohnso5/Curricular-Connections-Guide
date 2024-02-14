# Import necessary modules and classes
from Data_model.models import Role, RoleEnum, Administrator, Theme, Period, PeriodEnum, db
from sqlalchemy import event
import json
from pathlib import Path

# Define a function to create roles after Role table creation
@event.listens_for(Role.__table__, 'after_create')
def create_roles(*args, **kwargs):
    # Create Role objects based on RoleEnum values
    # Add all Role objects to the database session and commit changes
    db.session.add_all([Role(role=r) for r in RoleEnum])
    db.session.commit()

# Define a function to create administrators after Administrator table creation
@event.listens_for(Administrator.__table__, 'after_create')
def create_admins(*args, **kwargs):
    # Add specific Administrator objects with unity_id and associated role_id to the database session and commit changes
    db.session.add_all([
        Administrator(unity_id="rmmayo", role_id=1),
        Administrator(unity_id="npbleuze", role_id=1),
        Administrator(unity_id="pwgillen", role_id=1),
        Administrator(unity_id="msabrams", role_id=1),
        Administrator(unity_id="arosas2", role_id=1),
        Administrator(unity_id="acsawyer", role_id=1),
        Administrator(unity_id="deflower", role_id=1),
        Administrator(unity_id="gperezb", role_id=1),
        Administrator(unity_id="ahmalik", role_id=1),
	      Administrator(unity_id="njohnso5", role_id=1),
        Administrator(unity_id="xce", role_id=1),
        Administrator(unity_id="bswalia", role_id=1)
    ])
    db.session.commit()
    
# Define a function to create periods after Period table creation
@event.listens_for(Period.__table__, 'after_create')
def create_periods(*args, **kwargs):
    # Create Period objects based on PeriodEnum values
    summer = Period(period=PeriodEnum.SUMMER)
    spring = Period(period=PeriodEnum.SPRING)
    fall = Period(period=PeriodEnum.FALL)
    
    # Add all Period objects to the database session and commit changes
    db.session.add_all([summer, spring, fall])
    db.session.commit()

# Define a function to create themes after Theme table creation
@event.listens_for(Theme.__table__, 'after_create')
def create_themes(*args, **kwargs):
    # Define the path to the JSON file containing default themes
    dir = Path(__file__, '..').resolve()
    full_path = dir.joinpath("resources/default_themes.json")
    
    # Open and load the JSON file with themes data
    with open(full_path, 'r') as file:
        data = json.load(file)
    
    # Extract themes from the loaded JSON data
    themes = data['themes']
    
    # Create Theme objects based on themes extracted from the JSON and add them to the database session
    db.session.add_all([Theme(name=theme) for theme in themes])
    db.session.commit()
