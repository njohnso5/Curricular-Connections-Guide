import axios from 'axios';

const API_URL = "/api/v1/courses/";

class CourseService {
  getCourses () {
    return axios.get(API_URL);
  }

  /**
   * Remove a list of courses
   */
  removeCourses(courseIds: Number[] ) {
    console.log(courseIds);
    return axios.delete(API_URL + "delete/", { data : { courseIds }});
  }
}


export default new CourseService();