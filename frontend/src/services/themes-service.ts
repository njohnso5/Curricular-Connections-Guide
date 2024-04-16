import axios from 'axios';
import { Theme } from '../models/programModels';

const API_URL = "/api/v1/themes/"

class ThemesService {
    getTags() {
        return axios.get(API_URL);
    }

    createTheme(themeData: FormData) {
        return axios.post(API_URL, themeData, {headers: {"Content-Type": "multipart/form-data"}})
    }

    getTheme(id: Number) {
        return axios.get(API_URL + id);
    }

    removeTheme(themeId: Number) {
        return axios.delete(API_URL + themeId + "/");
    }

    updateProgramThemes(themes: Theme[], programId: number) {
        console.log(themes, programId, "updateProgramThemes");
        return axios.put(API_URL + 'program/' + programId + "/", themes);
    }

    updateCourseThemes(themes: Theme[], courseId: Number) {
        return axios.put(API_URL + 'course/' + courseId + "/", themes);
    }


}

export default new ThemesService();