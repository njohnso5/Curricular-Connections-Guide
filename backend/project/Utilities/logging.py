import datetime

class Logging:
    def logAPI(self, call : str):
        print("Running")
        now = datetime.datetime.now()
        with open('log.txt', 'w') as f:
            f.write(str(now) + '; ' + call + '\n')