import axios from 'axios';

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
}

export default new ThemesService();