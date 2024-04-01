import datetime
import os
import Data_model.adminlog_dao as adminlog_dao
from sqlalchemy.exc import SQLAlchemyError
from flask_smorest import abort

class Logging:
    def logAPI(file_name, log):
        try:
            #get the timestamp and add it to the log
            now = datetime.datetime.now()
            log.datetime = now
            #insert the log to admin log table
            adminlog_dao.insert(log)
        except SQLAlchemyError:
            abort(500, message="An error occured inserting the log")
        open(file_name, 'a')
        """ Insert given string as a new line at the beginning of a file """
        # define name of temporary dummy file
        dummy_file = file_name + '.bak'
        # open original file in read mode and dummy file in write mode
        with open(file_name, 'r') as read_obj, open(dummy_file, 'w') as write_obj:
            # Write given line to the dummy file
            write_obj.write(str(now) + '; ' + line + '\n')
            # Read lines from original file one by one and append them to the dummy file
            for line in read_obj:
                write_obj.write(line)
        # remove original file
        os.remove(file_name)
        # Rename dummy file as the original file
        os.rename(dummy_file, file_name)