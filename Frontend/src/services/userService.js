import axios from "axios";

let userId = 1;
const USER_JOURNAL_REST_URL = 'http://localhost:8080/users/' + userId + '/getJournal';

class UserService {
    getJournal() {
        axios.get(USER_JOURNAL_REST_URL);
    }
}

export default new UserService();