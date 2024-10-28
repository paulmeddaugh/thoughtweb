import axios from "axios";
import { checkIfArrays, checkIfNoteProps, checkIfNumbers, checkIfString } from "../scripts/utility/errorHandling";

const defaultConfig = { withCredentials: true };

export const loginWithEmailCredentials = async (email, password) => {
    return loginWithCredentials(email, password);
}

export const loginWithUsernameCredentials = async (username, password) => {
    return loginWithCredentials(username, password, false);
}

export const loginWithCredentials = async (emailOrUsername, password, usingEmail = true) => {
    checkIfString({ emailOrUsername, password });
    const body = usingEmail 
        ? { email: emailOrUsername, password } 
        : { username: emailOrUsername, password };
    console.log('request', body, `/api/login/internal?loginWithUsername=${!usingEmail}`);
    return axios.post(`/api/login/internal?loginWithUsername=${!usingEmail}`, body);
}

export const createNewUserOnBack = (user) => {
    return axios.post('/api/users/createUser', user);
}

export const getCurrentUserFromBackend = () => {
    return axios.get('/api/user');
};

export const sendResetPasswordEmailRequest = (email) => {
    return axios.post(`/api/user/resetPassword?email=${email}`);
}

export const updatePassword = (token, newPassword) => {
    return axios.post(`/api/user/savePassword`, { token, newPassword })
}

export const getJournalDataFromBack = async (userId) => {
    checkIfNumbers({ userId });
    return axios.get(`/api/users/${userId}/getJournal`, defaultConfig);
}

export const createNoteOnBack = async (note) => {
    checkIfNoteProps({ note });
    return axios.post('/api/notes/new', note, defaultConfig);
}

export const updateNoteOnBack = async (note) => {
    checkIfNoteProps({ note });
    return axios.put(`/api/notes/${note.id}/update`, note, defaultConfig);
}

export const deleteNoteOnBack = async (id) => {
    checkIfNumbers({ id });
    return axios.delete(`/api/notes/${id}/delete`, defaultConfig);
}

export const createNotebookOnBack = async (notebook) => {
    checkIfNumbers({ 'notebook.idUser': notebook.idUser });
    checkIfString({ 'notebook.name': notebook.name }); 
    return axios.post('/api/notebooks/new', notebook, defaultConfig);
}

export const deleteNotebookOnBack = async (idNotebook) => {
    checkIfNumbers({ idNotebook });
    return axios.delete(`/api/notebooks/${idNotebook}/delete`, defaultConfig);
}

export const addMultipleConnsOnBack = (userId, id1, id2Arr) => {
    checkIfNumbers({ userId, id1 });
    checkIfArrays({ id2Arr });
    const id2sStr = String(id2Arr).split(',');
	return axios.post(`/api/connections/new?idUser=${userId}&idNote1=${id1}&idNote2=${id2sStr}`, {}, defaultConfig);
}

export const deleteMultipleConnsOnBack = (userId, id1, id2Arr) => {
    checkIfNumbers({ userId, id1 });
    checkIfArrays({ id2Arr });
    const id2sStr = String(id2Arr).split(',');
    return axios.delete(`/api/connections/delete?idUser=${userId}&idNote1=${id1}&idNote2=${id2sStr}`, defaultConfig);
}

export const updateOrderOnBack = async (noteId, position) => {
    checkIfNumbers({ noteId });
    checkIfString({ position });
    const headers = { headers: {'Content-Type': 'text/plain'} };
    return axios.put(`/api/notes/${noteId}/updateOrder`, position, headers, defaultConfig);
}

export const logoutOnBackend = () => {
    return axios.get('/logout');
}