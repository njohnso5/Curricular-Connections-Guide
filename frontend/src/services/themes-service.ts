import api from './axios-config'

const BASE_URL = "/themes"

class ThemesService {
    getTags() {
        return api.get(BASE_URL + "/");
    }

    createTheme(themeData: FormData) {
        return api.post(BASE_URL + "/", themeData, {headers: {"Content-Type": "multipart/form-data"}})
    }

    getTheme(id: Number) {
        return api.get(BASE_URL + "/" + id);
    }

    removeTheme(themeId: Number) {
        return api.delete(BASE_URL + "/" + themeId + "/");
    }
}

export default new ThemesService();