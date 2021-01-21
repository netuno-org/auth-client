# auth-client

Client to integrations with Netuno Services Authentication using JWT (JSON Web Token).

More about the [Netuno Platform](https://netuno.org/).

This module makes is easy to support JWT in web applications.

After login is made the Authorization header will be automatically loaded.

With this any `_service(...)` call will automatically be authenticated.

### Install

`npm i -S @netuno/auth-client`

### Import

`import _auth from '@netuno/auth-client';`

### Remember

After the login any `_service(...)` call will automatically be authenticated.

### Config

Defines the main events:

```
_auth.config({
    onLogin: () => { alert("Logged in!"); },
    onLogout: () => { alert("Logged out!"); }
});
```

Default config parameters:

```
{
    prefix: '',
    url: '_auth',
    autoLoadServiceHeaders: true,
    autoRefreshToken: true,
    login: {
        usernameKey: 'username',
        passwordKey: 'password'
    },
    refreshToken: {
        parameterKey: 'refresh_token'
    },
    token: {
        storageKey: '_auth_token',
        resultKey: 'result',
        expiresInKey: 'expires_in',
        accessTokenKey: 'access_token',
        refreshTokenKey: 'refresh_token',
        tokenTypeKey: 'token_type',
        expiresInDefault: null,
        tokenTypeDefault: null
    },
    onLogin: () => {},
    onLogout: () => {}
}
```

### Usage

This module depends of `@netuno/service-client`.

So the prefix url should be defined in the `_service.config`, like:

```
_service.config({
    prefix: 'http://localhost:9000/services/'
});
```

In the global configuration (`_auth.config({...})`) or with the object passed to the service function (`_auth.login({...})`), you can set or override any configuration parameters.

The token is stored in the `sessionStorage` with the configuration key defined in `token.storageKey`.

##### Login

With success the event `_auth.config({ onLogin: ()=> ... })` will be invoked.

```
    _auth.login({
        username: "admin",
        password: "secret",
        success: ()=> {
            alert("Success.");
        },
        fail: ()=> {
            alert("Fail.");
        }
    });
```

With ReactJS:

```
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
    
    return (
        <div className="App">
            <h4>Login</h4>
            <p><input ref={inputUsername} type="text" placeholder="Username" /></p>
            <p><input ref={inputPassword} type="password" placeholder="Password" /></p>
            <button type="button" onClick={handleLogin}>Login</button>
        </div>
    );
```

##### Logout

To logout just call this:

```
    _auth.logout();
```

The event `_auth.config({ onLogout: ()=> ... })` will be invoked.

##### Check if is Logged

```
if (_auth.isLogged()) {
    alert('Is logged!');
}
```

### Refresh Token

The refresh token is made automatically.

But is possible to make it manually:

```
    _auth.refreshToken({
        success: ()=> {
            alert("Success.");
        },
        fail: ()=> {
            alert("Fail.");
        }
    });
```
