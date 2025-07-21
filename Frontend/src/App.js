import styles from './styles/App.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/universalStyles.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/LoginComponents/Login.js';
import CreateAccount from './components/LoginComponents/CreateAccount.js';
import ForgotPassword from './components/LoginComponents/ForgotPassword';
import Header from './components/Header';
import NoteBoxLayout from './components/NoteBox/NoteBoxLayout';
import Editor from './components/Editor/Editor';
import CreateNoteButton from './components/Editor/CreateNoteButton';
import Account from './components/Account';
import ThoughtWall from './components/ThoughtWall/ThoughtWall';
import UpdatePassword from './components/LoginComponents/ChangePassword';
import { NoteboxProvider } from './context/notebox.js';

import { useEffect } from 'react';
import useForm from './hooks/useForm.js';
import { loginValidators } from './scripts/forms/validate.js';
import { useUser } from './context/user.js';
import { useNoteGraph } from './context/noteGraph.js';
import { useNoteOrder } from './context/noteOrder.js';
import { useSelected } from './context/selected.js';
import { useNotebooks } from './context/notebooks.js';
import { useLoading } from './context/loading.js';

import loadJournal from './scripts/graph/loadJournal.js';

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
    const { graph } = useNoteGraph();
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
                <CreateNoteButton />
            </BrowserRouter>
        </NoteboxProvider>
    );
}

const App = () => {
    const { user } = useUser();
    const { graph, setGraph } = useNoteGraph();
    const { setNoteOrder } = useNoteOrder();
    const { setNotebooks } = useNotebooks();
    const { setSelectedNote, setSelectedNotebook } = useSelected();
    const { setLoading } = useLoading();
    useEffect(() => {
        if (user?.id) {
            console.log('reload firing');
            loadJournal(user.id, (g, nbs, noteOrder) => {
                // Notebooks
                setNotebooks(nbs);

                // Notes and order
                setGraph(g);
                setNoteOrder(noteOrder);

                // Will select the first note of ordered notes once calculated
                setSelectedNotebook(null);

                setLoading(false);
            });
        }
    }, [user?.id, setLoading, setNotebooks, setGraph, setSelectedNote, setNoteOrder, setSelectedNotebook]);
    return (
        <>
            <div id='portals' />
            <div id='dataTransferImage' />
            <main className={styles.fullSize}>
                {(!graph || !user?.id) ? (
                    <LoggedOutStack />
                ) : (
                    <LoggedInStack/>
                )}
            </main>
        </>
    );
}

export default App;