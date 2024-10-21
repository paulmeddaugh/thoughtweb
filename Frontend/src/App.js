import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { positionAfter } from './scripts/utility/customOrderingAsStrings';
import { LoginProvider } from './components/LoginProvider';
import { useSharedState } from './hooks/useGlobalState';
import { usePreload } from './hooks/usePreload.js';
import { loginWithCredentials, getCurrentUserFromBackend, logoutOnBackend } from './axios/axios';
import { NO_NOTES_POSITION_BEGIN, WINDOW_WIDTH_TO_FILL } from './constants/constants';
import styles from './styles/App.module.css';
import Login from './components/LoginComponents/Login.js';
import CreateAccount from './components/LoginComponents/CreateAccount.js';
import ForgotPassword from './components/LoginComponents/ForgotPassword';
import Header from './components/Header';
import NoteBoxLayout from './components/NoteBox/NoteBoxLayout';
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

// preload images
import background from "./resources/backgroundWithoutVignette.png";
import backgroundPortrait from "./resources/backgroundPortrait.jpg";
import justNotebook from "./resources/justNotebook.png";
import journalBackground from "./resources/journalBackground2.png";
import accountBackground from "./resources/accountBackground2 - desktop.png";
import pinIconUnfilled from "./resources/pinIconUnfilled.png";
import pinIconFilled from "./resources/pinIconFilled.png";
import journalGif from "./resources/loadingImages/journalOpen2.gif";
import journalClosed from "./resources/loadingImages/journalClosed.png";
import Fader from './components/global/Fader.js';

const preloading = {
    images: [
        background, 
        backgroundPortrait, 
        justNotebook,
        journalBackground, 
        accountBackground, 
        pinIconUnfilled, 
        pinIconFilled,
        journalGif,
        journalClosed
    ],
    fonts: [
        'Abuget',
        'Corbel',
        'Corbel Light'
    ]
};

const App = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { isPreloaded, preloadComponents } = usePreload(preloading);
    const [isLoadingScreenFading, setLoadingScreenFading] = useState(false);

    const [user, setUser] = useState(null);
    const [graph, setGraph] = useState(null);
    const [userOrder, setUserOrder] = useState([]);
    const [notebooks, setNotebooks] = useState([]);
    const [selected, setSelected] = useState({}); // format: { note: ___, index: ___ }
    const [loading, setLoading] = useState({ icon: 2 });
    const [newNoteId, setNewNoteId] = useState(-1);

    const [ ,setPinned] = useSharedState('notebox/isPinned', true);

    const headerRef = useRef(null);

    useEffect(() => {
        const queryParameters = new URLSearchParams(window.location.search)
        const oauth = queryParameters.get("usingOauth");

        if (oauth) {
            onOAuth2Login?.();
        }
    }, []);

    useEffect(() => {
        if (user?.id) {
            loadJournal(user.id, (g, nbs, userOrder) => {

                nbs.unshift({ name: 'All Notebooks' });
                setNotebooks(nbs);

                const firstNoteGraphIndex = userOrder[0]?.graphIndex;
                if (firstNoteGraphIndex) {
                    setSelected({ note: g.getVertex(firstNoteGraphIndex), index: firstNoteGraphIndex });
                }
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

        setGraph(null);
        setUser(null);
        setUsername('');
        setPassword('');
    }
    
    const onHeaderMount = (navigate) => {
        if (graph.size() === 0) navigate('/editor');
    }

    const onEditorMount = (e) => {
        if (graph.size() === 0) createNoteClick();
    }

    const handlePreloadingAnimationFinished = () => {
        setLoading(false);
        setLoadingScreenFading(false);
    }

    return (
        <div className={styles.fullSize}>
            {loading && (
                <Fader 
                    className={styles.fullSize} 
                    fadeOut={isLoadingScreenFading} 
                    style={isLoadingScreenFading ? { position: 'absolute', zIndex: 20 } : null}
                    onFadeOutFinish={handlePreloadingAnimationFinished}
                >
                    <Loading 
                        icon={loading.icon ?? 1}
                        status={loading.status ?? ' '}
                        linkText={loading.linkText}
                        linkOnClick={() => setLoading(false)}
                        startExitAnimation={isPreloaded}
                        onFinishExitAnimation={() => setLoadingScreenFading(true)}
                    >
                        {!isPreloaded && preloadComponents}
                    </Loading>
                </Fader>
            )}
            {(!loading || isLoadingScreenFading) && (
                (!graph || !user?.id) ? (
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
                )
            )}
        </div>
    );
}

export default App;