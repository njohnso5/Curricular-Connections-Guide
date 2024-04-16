import axios from 'axios';

const API_URL = "/api/v1/program/";

class ProgramService {
  getUpcomingPrograms () {
    return axios.get(API_URL + "?display=upcoming");
  }

  getPastPrograms () {
    return axios.get(API_URL + "?display=past");
  }

  getAllPrograms () {
    return axios.get(API_URL);
  }

  getProgramsBySemester (semester_id: Number) {
    return axios.get(API_URL + "semester/" + semester_id + "/");
  }

  getProgram (id: Number) {
    return axios.get(API_URL + id + "/");
  }

  deleteProgram (id: Number) {
    return axios.delete(API_URL + id + "/");
  }

  // Handles the update program API behavior
  updateProgram (program: FormData) {
    // program.id
    return axios.put(API_URL, program, {headers: { "Content-Type": "multipart/form-data" }});
  }

  uploadProgram (programform: FormData) {
    return axios.post(API_URL, programform, {headers: { "Content-Type": "multipart/form-data" }});
  }

  getDepartments () {
    return axios.get(API_URL + "departments/")
  }

  postEmails (id: Number) {
    return axios.post(API_URL + "/" + id + "/email/")
  }

  getRelatedCourses(id: number, page: number, per_page: number, threshold: number) {
    return axios.get(API_URL + `${id}/courses/?page=${page}&per_page=${per_page}&threshhold=${threshold}`)
  }
}

export default new ProgramService();