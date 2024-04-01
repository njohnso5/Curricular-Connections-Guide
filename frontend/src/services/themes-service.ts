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

    getProgramThemes(programId: Number) {
        return axios.get(API_URL + 'program/' + programId + "/");
        // return "getProgramThemes" + programId;
    }
    updateProgramThemes(themes: Theme[], programId: number) {
        const requestBody = themes.map(theme => ({id: theme.id, name: theme.name}));
        return axios.put(API_URL + 'program/' + programId + "/", requestBody);
    }

    getCourseThemes(courseId: Number) {
        // return axios.get(API_URL + 'courses/' + courseId + "/");
        return "getCourseThemes" + courseId;
    }

    updateCourseThemes(themeIds: [Number], courseId: Number) {
        // return axios.put(API_URL + 'courses/' + courseId + "/", {'themeIds': themeIds, 'courseId': courseId});
        return "updateCourseThemes" + themeIds + courseId;
    }


}

export default new ThemesService();