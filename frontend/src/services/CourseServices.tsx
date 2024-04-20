import axios from 'axios';
import { CourseForm } from '../CourseModels/courseModels';

const API_URL = "/api/v1/courses/";

class CourseService {
  getCourses () {
    return axios.get(API_URL);
  }

  /**
   * 
   * @param courseForm a Json object
   * @returns 
   */
  addCourse (courseForm: FormData) {
    return axios.post(API_URL, courseForm, { headers: { "Content-Type": "multipart/form-data" }})
  }

  updateCourse (courseForm: FormData) {
    console.log('In updateCourse api call');
    return axios.put(API_URL, courseForm, { headers: { "Content-Type": "multipart/form-data" }})
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