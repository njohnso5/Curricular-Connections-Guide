import datetime

class Logging:
    def log(self, call : str):
        now = datetime.datetime.now()
        with open('log.txt', 'w') as f:
            f.write(now + '; ' + call + '\n')