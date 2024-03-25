import axios from 'axios';
const API_URL = "/api/v1/semesters/";

class SemesterService {
  getSemesters () {
    return axios.get(API_URL);
  }
  
  getActiveSemester () {
    return axios.get(API_URL + 'active/')
  }

  setActive (semesterData: FormData, semesterId: Number) {
    return axios.put(API_URL + 'active/' + semesterId + '/', semesterData, {headers: { "Content-Type": "multipart/form-data" }});
  }

  createSemester (semesterData: FormData) {
    return axios.post(API_URL, semesterData, {headers: { "Content-Type": "multipart/form-data" }})
  }

  getProgram (id: Number) {
    return axios.get(API_URL + id);
  }

  removeSemester(semesterId: Number ) {
    return axios.delete(API_URL + semesterId + '/');
  }
  
  getCourses(semesterId: Number) {
    return axios.get(API_URL + semesterId + '/courses/')
  }
}

export default new SemesterService();