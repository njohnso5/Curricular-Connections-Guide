import axios from 'axios';

const API_URL = "/api/v1/courses/";

class CourseService {
  getCourses () {
    return axios.get(API_URL);
  }
}

export default new CourseService();