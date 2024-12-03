import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { LoadingProvider } from './context/loading';
import { AuthTokensProvider } from './context/authTokens';
import { UserProvider } from './context/user';
import { NoteGraphProvider } from './context/noteGraph';
import { NotebooksProvider } from './context/notebooks';
import { SelectedProvider } from './context/selected';
import { NoteOrderProvider } from './context/noteOrder';
import { NotePointsProvider } from './context/notePoints';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthTokensProvider>
      <UserProvider>
        <LoadingProvider>
          <SelectedProvider>
            <NoteGraphProvider>
              <NotebooksProvider>
                <NoteOrderProvider>
                  <NotePointsProvider>
                    <App />
                  </NotePointsProvider>
                </NoteOrderProvider>
              </NotebooksProvider>
            </NoteGraphProvider>
          </SelectedProvider>
        </LoadingProvider>
      </UserProvider>
    </AuthTokensProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
