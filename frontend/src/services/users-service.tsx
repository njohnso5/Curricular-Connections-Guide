import api from './axios-config'

const BASE_URL = "/users"

class UserService {
    getCurrentUser() {
        return api.get(BASE_URL + "/current/");
    }
}

export default new UserService();