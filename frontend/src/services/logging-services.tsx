import axios from 'axios';

const API_URL = "/api/v1/log/";

class LoggingService {
  getAdminLogs () {
    return axios.get(API_URL);
  }
  getUserLogs() {
    return axios.get(API_URL + "user/");
  }

}

export default new LoggingService();