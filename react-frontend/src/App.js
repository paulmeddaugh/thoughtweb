import { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { positionAfter } from './scripts/utility/customOrderingAsStrings';
import { LoginProvider } from './components/LoginProvider';
import { useSharedState } from './hooks/useGlobalState';
import { loginWithCredentials, getCurrentUserFromBackend, logoutOnBackend } from './axios/axios';
import { NO_NOTES_POSITION_BEGIN, WINDOW_WIDTH_TO_FILL } from './constants/constants';
import styles from './styles/App.module.css';
import Login from './components/LoginComponents/Login.js';
import CreateAccount from './components/LoginComponents/CreateAccount.js';
import ForgotPassword from './components/LoginComponents/ForgotPassword';
import Header from './components/Header';
import NoteBoxLayout from './components/NoteBox/NoteBoxLayout';
import Graph from './scripts/graph/graph';
import loadJournal from "./scripts/graph/loadJournal.js";
import Editor from './components/Editor/Editor';
import CreateNoteButton from './components/Editor/CreateNoteButton';
import Account from './components/Account';
import ThoughtWall from './components/ThoughtWall/ThoughtWall';
import Loading from './components/LoginComponents/Loading';
import Note from './scripts/notes/note';
import UpdatePassword from './components/LoginComponents/ChangePassword';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/universalStyles.css';

const App = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [user, setUser] = useState(null);
    const [graph, setGraph] = useState(null);
    const [userOrder, setUserOrder] = useState([]);
    const [notebooks, setNotebooks] = useState([]);
    const [selected, setSelected] = useState({}); // format: { note: ___, index: ___ }
    const [loading, setLoading] = useState(false);
    const [newNoteId, setNewNoteId] = useState(-1);

    const [ , setPinned] = useSharedState('notebox/isPinned', true);

    const headerRef = useRef(null);

    useEffect(() => {
        if (user?.id) {
            loadJournal(user.id, (g, nbs, userOrder) => {

                nbs.unshift({ name: 'All Notebooks' });
                setNotebooks(nbs);

                setSelected({ note: g.getVertex(userOrder[0].graphIndex), index: 0 });
                setPinned(!(!g.size() && window.innerWidth < WINDOW_WIDTH_TO_FILL));

                setUserOrder(userOrder);
                setGraph(g);

                setLoading(false);
            });
        }
    }, [user]);

    const createNoteClick = (e, prevRoutePath) => {
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
    }

    const onLoginSubmit = (username, password) => {
        setLoading({ status: 'Loading...', icon: 0 });

        loginWithCredentials(username, password).then(async response => {
            setUser(response?.data?.user);
        }).catch(async (error) => {
            console.log(error);
            if (String(error?.response?.data).startsWith('Proxy error')) {
                setLoading({ status: 'The backend is not running.', linkText: 'Retry' });
            } else {
                // retrys to access the user data again, sometimes it doesn't recognize auth immediately
                if (error?.response?.data === '') {
                    const res = await getCurrentUserFromBackend();
                    if (res.data) {
                        setUser(res.data.user);
                        return;
                    }
                }

                setLoading({ 
                    status: error?.response ? `${error.response?.data?.exception ?? 'Error'} | ${error.response?.status}` : 'There has been an error.', 
                    linkText: 'Retry'
                });
            }
        });
    }

    const onOAuth2Login = useCallback(async () => {
        const userResponse = await getCurrentUserFromBackend();
        if (userResponse?.data?.user?.id) {
            setLoading({ status: 'Loading...', icon: 0 });
            setUser(userResponse?.data?.user);
        }
    }, []);

    const onLogout = async () => {
        await logoutOnBackend();

        setUser(null);
        setGraph(null);
        setUsername('');
        setPassword('');
    }

    const onEditorMount = (e) => {
        if (graph.size() === 0) createNoteClick();
    }

    const onHeaderMount = (navigate) => {
        // If no notes logging in, navigate to Editor, which will create a new note under such conditions
        if (graph.size() === 0) navigate('/editor');
    }

    if (loading) {
        return (
            <Loading 
                status={loading.status ?? ' '} 
                linkProps={{ text: loading.linkText, onClick: () => setLoading(false)}}
                icon={loading.icon ?? 1}
            />
        )
    }

    return (
        <div className={styles.fullSize}>
            {!graph ? (
                <BrowserRouter>
                    <Routes>
                        <Route path="*" element={
                            <Login 
                                usernameValue={username}
                                passwordValue={password}
                                onUsernameChange={(e) => setUsername(e.target.value)}
                                onPasswordChange={(e) => setPassword(e.target.value)}
                                onSubmit={onLoginSubmit}
                                onOAuth2Login={onOAuth2Login}
                            />
                        } />
                        <Route path="createAccount/*" element={<CreateAccount />} />
                        <Route path="forgotPassword/*" element={<ForgotPassword />} />
                        <Route path="changePassword/*" element={<UpdatePassword />} />
                    </Routes>
                </BrowserRouter> 
            ) : (
                <BrowserRouter >
                    <Header 
                        ref={headerRef} 
                        username={user.username} 
                        onMount={onHeaderMount}
                        onLogoClick={onLogout} 
                    />
                    <LoginProvider
                        graph={graph}
                        setGraph={setGraph}
                        userOrder={userOrder} 
                        setUserOrder={setUserOrder}
                        selected={selected}
                        setSelected={setSelected}
                        notebooks={notebooks}
                        setNotebooks={setNotebooks}
                        userId={user.id}
                    >
                        <Routes>
                            <Route path="/" element={
                                <NoteBoxLayout>
                                    <ThoughtWall/>
                                </NoteBoxLayout>
                            } />
                            <Route path="/editor" element={
                                <NoteBoxLayout>
                                    <Editor
                                        onMount={onEditorMount}
                                        newNoteId={newNoteId}
                                    />
                                </NoteBoxLayout>
                            } />
                            <Route path="/account" element={
                                <Account 
                                    name={user.name}
                                    username={user.username}
                                    email={user.email}
                                    dateCreated={user.dateCreated}
                                    noteCount={graph?.size() ?? 0}
                                    notebookCount={notebooks.length - 1}
                                />
                            } />
                        </Routes>
                        <CreateNoteButton onClick={createNoteClick}/>
                    </LoginProvider>
                </BrowserRouter>
            )}
        </div>
        
    );
}

export default App;