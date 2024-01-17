import api from './axios-config'

const BASE_URL = "/administrators"

class AdministratorService {
    getAdministrators() {
        return api.get(BASE_URL + "/");
    }
    
    deleteAdministrator(id: number) {
        return api.delete(BASE_URL + `/${id}/`);
    }

    updateAdministratorRole(id: number, roleId: number) {
        return api.put(BASE_URL + `/${id}/`, {id: roleId});
    }

    createAdministrator(unityId: string, roleId: number) {
        return api.post(BASE_URL + `/`, {unity_id: unityId, role_id: roleId})
    }


}

export default new AdministratorService();