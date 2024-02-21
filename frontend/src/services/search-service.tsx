import axios from 'axios';
import { SearchQuery } from '../models/searchModels';

const API_URL = "/api/v1/search/"

class SearchService {
    getSearchResults(query: SearchQuery) {
        // console.log(query);
        return axios.post(API_URL, query);
    }
}

export default new SearchService();
