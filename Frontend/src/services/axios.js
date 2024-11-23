import axios from "axios";
import { checkIfArrays, checkIfNoteProps, checkIfNumbers, checkIfString } from "../scripts/utility/errorHandling";
import { isValidEmail } from "../scripts/utility/utility";
import { Connection } from "../scripts/notes/connection";

const defaultConfig = {};

export const setAxiosBearerToken = (bearerToken) => {
    axios.defaults.headers.common = { 'Authorization': `Bearer ${bearerToken}` };
}

export const loginWithEmailCredentials = async (email, password) => {
    return loginWithCredentials(email, password);
}

export const loginWithUsernameCredentials = async (username, password) => {
    return loginWithCredentials(username, password, false);
}

export const loginWithCredentials = async (emailOrUsername, password) => {
    checkIfString({ emailOrUsername, password });
    const usingEmail = isValidEmail(emailOrUsername);
    const body = usingEmail 
        ? { email: emailOrUsername, password } 
        : { username: emailOrUsername, password };
    return axios.post(`/api/login`, body);
}

export const getGoogleAccessTokens = (token) => {
    return axios.get(`/api/login/google-tokens?token=${token}`);
};

export const createNewUserOnBack = (user) => {
    return axios.post('/api/user/create', user);
}

export const getCurrentUserFromBackend = () => {
    return axios.get('/api/user');
};

export const sendResetPasswordEmailRequest = (email, redirectUrl) => {
    return axios.post(`/api/user/reset-password?email=${email}&redirectUrl=${redirectUrl}`);
}

export const updatePassword = (token, newPassword) => {
    return axios.post(`/api/user/save-password`, { token, newPassword })
}

export const getJournalDataFromBack = async (userId) => {
    checkIfString({ userId });
    return axios.get(`/api/user/journal`, defaultConfig);
}

export const createNoteOnBack = async (note) => {
    checkIfNoteProps({ note });
    return axios.post('/api/notes', note, defaultConfig);
}

export const updateNoteOnBack = async (note) => {
    checkIfNoteProps({ note });
    return axios.put(`/api/notes/${note.id}`, note, defaultConfig);
}

export const deleteNoteOnBack = async (id) => {
    checkIfNumbers({ id });
    return axios.delete(`/api/notes/${id}`, defaultConfig);
}

export const createNotebookOnBack = async (notebook) => {
    checkIfString({ 'notebook.idUser': notebook.idUser, 'notebook.name': notebook.name }); 
    return axios.post('/api/notebooks', notebook, defaultConfig);
}

export const updateNotebookOnBack = async (notebook) => {
    checkIfNumbers({ 'notebook.id': notebook.id });
    checkIfString({ 'notebook.idUser': notebook.idUser, 'notebook.name': notebook.name }); 
    return axios.put(`/api/notebooks/${notebook.id}`, notebook, defaultConfig);
}

export const deleteNotebookOnBack = async (idNotebook) => {
    checkIfNumbers({ idNotebook });
    return axios.delete(`/api/notebooks/${idNotebook}`, defaultConfig);
}

export const addMultipleConnsOnBack = async (userId, idNote1, idNote2Array) => {
    checkIfArrays({ idNote2Array });
    const connections = Connection.fromIdNote2Array(null, idNote1, idNote2Array, userId);
    console.log('connections', connections);
	return axios.post(`/api/connections`, connections, defaultConfig);
}

export const deleteMultipleConnsOnBack = async (userId, idNote1, idNote2Array) => {
    checkIfArrays({ idNote2Array });
    const connections = Connection.fromIdNote2Array(null, idNote1, idNote2Array, userId);
    return axios.patch(`/api/connections/delete-requests`, connections, defaultConfig);
}

export const updateOrderOnBack = async (noteId, position) => {
    checkIfNumbers({ noteId });
    checkIfString({ position });
    // const headers = { headers: {'Content-Type': 'text/plain'} };
    return new Promise(resolve => resolve());
    // checkIfNumbers({ noteId, notebookId });
    // checkIfString({ position });
    // if (!notebookId) {
    //     return axios.put(`/api/notes/${noteId}`, noteId, defaultConfig);
    // } else {
    //     return axios.put(`/api/notebooks/${notebookId}`, noteId, defaultConfig);
    // }
    // return axios.put(`/api/notes/${noteId}/updateOrder`, position, headers, defaultConfig);
}

export const logoutOnBackend = () => {
    return axios.post('/api/logout');
}