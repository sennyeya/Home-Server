import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import App from './App';
import MessageDisplayBoundary from './contexts/MessagingContext';
import UserBoundary from './contexts/UserContext'
import ThemeBoundary from './contexts/ThemeContext';
import AuthorizationBoundary from './contexts/AuthorizationContext';
import ApiBoundary from './contexts/ApiContext';
import ErrorBoundary from './ErrorBoundary';

ReactDOM.render(
    <MessageDisplayBoundary>
        <ErrorBoundary>
            <ThemeBoundary>
                <AuthorizationBoundary>
                    <ApiBoundary>
                        <UserBoundary>
                            <App/>
                        </UserBoundary>
                    </ApiBoundary>
                </AuthorizationBoundary>
            </ThemeBoundary>
        </ErrorBoundary>
    </MessageDisplayBoundary>, document.getElementById('root')) 

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
