import api from './axios-config'

const BASE_URL = "/themes"

class ThemesService {
    getTags() {
        return api.get(BASE_URL + "/");
    }
}

export default new ThemesService();