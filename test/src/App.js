import React, { useRef } from 'react';

import logo from './logo.svg';

import _service from '@netuno/service-client';
import _auth from '@netuno/auth-client';

import './App.css';

_service.config({
    prefix: 'http://localhost:9000/services/'
});

_auth.config({
    onLogin: () => { alert("Login!!!"); },
    onLogout: () => { alert("Logout!!!"); }
})

function App() {
    const inputUsername = useRef(null);
    const inputPassword = useRef(null);
    const handleLogin = () => {
        const username = inputUsername.current.value;
        const password = inputPassword.current.value;
        _auth.login({
            username,
            password,
            success: ()=> {
                alert("Success.");
            },
            fail: ()=> {
                alert("Fail.");
            }
        });
    };
    const handleIsLogged = () => {
        alert(_auth.isLogged() ? "YES" : "NO");
    };
    const handleLogout = () => {
        _auth.logout();
    };
    const handleRefreshToken = () => {
        _auth.refreshToken({
            success: ()=> {
                alert("Success.");
            },
            fail: ()=> {
                alert("Fail.");
            }
        });
    };
    return (
        <div className="App">
          <div>
            <h4>Login</h4>
            <p><input ref={inputUsername} type="text" placeholder="Username" /></p>
            <p><input ref={inputPassword} type="password" placeholder="Password" /></p>
            <button type="button" onClick={handleLogin}>Login</button>
          </div>
          <div>
            <p>
              <button type="button" onClick={handleIsLogged}>Is Logged?</button>
              <button type="button" onClick={handleLogout}>Logout</button>
              <br/>
              <button type="button" onClick={handleRefreshToken}>Refresh</button>
            </p>
          </div>
        </div>
    );
}

export default App;
