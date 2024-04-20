import datetime
import os
import Data_model.adminlog_dao as adminlog_dao
import Data_model.userlog_dao as userlog_dao
from sqlalchemy.exc import SQLAlchemyError
from flask_smorest import abort
from flask import g
from pytz import timezone

def logAPI(log):
    try:
        tz = timezone('EST')
        #get the timestamp and add it to the log
        now = datetime.datetime.now(tz)
        log.datetime = now
        #insert the log to admin log table
        adminlog_dao.insert(log)
    except SQLAlchemyError:
        abort(500, message="An error occured inserting the log")

def logQuery(log):
    try:
        tz = timezone('EST')
        now = datetime.datetime.now(tz)
        log.datetime = now
        userlog_dao.insert(log)
    except SQLAlchemyError:
        abort(500, message="An error occured inserting the log")