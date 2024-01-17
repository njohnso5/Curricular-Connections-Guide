import api from './axios-config'

const BASE_URL = "/roles"

class RolesService {
    getRoles() {
        return api.get(BASE_URL + "/");
    }
}

export default new RolesService();