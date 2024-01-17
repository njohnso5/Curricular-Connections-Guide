import axios from 'axios';

const API_URL = "/api/v1/periods/";

class PeriodService {
  getPeriods () {
    return axios.get(API_URL);
  }

}

export default new PeriodService();