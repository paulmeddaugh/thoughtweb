import { useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { positionAfter } from './scripts/utility/customOrderingAsStrings';
import { useAppContent } from './context/appContent.js';
import { NO_NOTES_POSITION_BEGIN } from './constants/constants';
import styles from './styles/App.module.css';
import Login from './components/LoginComponents/Login.js';
import CreateAccount from './components/LoginComponents/CreateAccount.js';
import ForgotPassword from './components/LoginComponents/ForgotPassword';
import Header from './components/Header';
import NoteBoxLayout from './components/NoteBox/NoteBoxLayout';
import Editor from './components/Editor/Editor';
import CreateNoteButton from './components/Editor/CreateNoteButton';
import Account from './components/Account';
import ThoughtWall from './components/ThoughtWall/ThoughtWall';
import Note from './scripts/notes/note';
import UpdatePassword from './components/LoginComponents/ChangePassword';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/universalStyles.css';

import { NoteboxProvider } from './context/notebox.js';
import useForm from './hooks/useForm.js';
import { loginValidators } from './scripts/forms/validate.js';
import { useUser } from './context/user.js';

const LoggedOutStack = ({ children }) => {
    const { formState, formErrors, onFormInputChange } = useForm({ usn: '', pwd: '' }, loginValidators);
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={
                    <Login 
                        formState={formState}
                        formErrors={formErrors}
                        onFormStateChange={onFormInputChange}
                    />
                } />
                <Route path="/createAccount/*" element={<CreateAccount />} />
                <Route path="/forgotPassword/*" element={<ForgotPassword />} />
                <Route path="/changePassword/*" element={<UpdatePassword />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter> 
    );
}

const LoggedInStack = ({ children }) => {
    const { graph, setGraph, userOrder, setUserOrder, setSelected, newNoteId, setNewNoteId } = useAppContent();

    const handleCreateNoteClick = useCallback((e, prevRoutePath) => {
        // Determines new ordering value of the new note
        const newPosition = userOrder.length !== 0 ? 
              positionAfter(userOrder[userOrder.length - 1]?.order) 
            : NO_NOTES_POSITION_BEGIN;

        /* Resets the new note id decrementing count to -1 if clicked away from editor,
         * as the Editor deletes all unsaved notes when unmounting for efficiency. */ 
        const newId = (prevRoutePath !== '/editor') ? -1 : newNoteId;
        const newNote = new Note(newId, '', '', '', null, true, new Date(), newPosition);

        graph.addVertex(newNote);
        setGraph(graph.clone());

        userOrder.push({ id: newId, graphIndex: graph.size() - 1, order: newPosition });
        setUserOrder(userOrder.concat());

        setNewNoteId(newId - 1); // Decrements new id count
        setSelected({ note: newNote, index: graph.size() - 1 });
    }, [graph, newNoteId, setGraph, setNewNoteId, setSelected, setUserOrder, userOrder]);

    return (
        <NoteboxProvider>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to={graph?.size() !== 0 ? "/thoughtwall" : '/editor'} replace />} />
                    <Route path="/thoughtwall" element={
                        <NoteBoxLayout>
                            <ThoughtWall/>
                        </NoteBoxLayout>
                    } />
                    <Route path="/editor" element={
                        <NoteBoxLayout>
                            <Editor />
                        </NoteBoxLayout>
                    } />
                    <Route path="/account" element={<Account />} />
                    <Route path="*" element={<Navigate to="/thoughtwall" replace />} />
                </Routes>
                <CreateNoteButton onClick={handleCreateNoteClick} />
            </BrowserRouter>
        </NoteboxProvider>
    );
}

const App = () => {
    const { graph } = useAppContent();
    const { user } = useUser();
    return (
        <main className={styles.fullSize}>
            {(!graph || !user?.id) ? (
                <LoggedOutStack />
            ) : (
                <LoggedInStack/>
            )}
        </main>
    );
}

export default App;