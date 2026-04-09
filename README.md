# auth-client

Authentication client for Netuno Platform services integrations using JWT (JSON Web Token).

<a href="https://www.npmjs.com/package/@netuno/auth-client"><img src="https://img.shields.io/npm/v/@netuno/auth-client.svg?style=flat" alt="npm version"></a>

See more about the [Netuno Platform](https://netuno.org/): open source, low-code, and polyglot.

This module makes is easy to support JWT in web applications.

After the login is made, the Authorization header will be automatically loaded.

With this any `_service(...)` call will automatically be authenticated.

### Install

`npm i -S @netuno/auth-client`

### Import

`import _auth from '@netuno/auth-client';`

### Remember

After the login any `_service(...)` call will automatically be authenticated.

### Config

Defines the main events:

```javascript
_auth.config({
    onLogin: () => { alert("Logged in!"); },
    onLogout: () => { alert("Logged out!"); }
});
```

Full configuration with default values:

```javascript
_auth.config({
    prefix: '',
    url: '_auth',
    autoLoadServiceHeaders: true,
    autoRefreshToken: true,
    storage: 'session',
    login: {
        usernameKey: 'username',
        passwordKey: 'password',
        altchaKey: 'altcha'
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
});
```

### Usage

This module depends on `@netuno/service-client`.

So the prefix url should be defined in the `_service.config({ prefix: '...' })`, like:

```javascript
_service.config({
    prefix: 'http://localhost:9000/services/'
});
```

In the global configuration (`_auth.config({...})`) or with the object passed to the service function (`_auth.login({...})`), you can set or override any configuration parameters.

The token is stored in the `sessionStorage` with the configuration key defined in `token.storageKey`.

To store the token in the `localStorage` change the `storage` configuration to `local`:

```javascript
_service.config({
    storage: 'local'
})
```

### Login

With success the event `_auth.config({ onLogin: ()=> ... })` will be invoked.

```javascript
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

```javascript
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

### Logout

To logout just call this:

```javascript
    _auth.logout();
```

The event `_auth.config({ onLogout: ()=> ... })` will be invoked.

### Logged Check

```javascript
if (_auth.isLogged()) {
    alert('Is logged!');
}
```

### Refresh Token

The refresh token is made automatically.

But is possible to make it manually:

```javascript
    _auth.refreshToken({
        success: ()=> {
            alert("Success.");
        },
        fail: ()=> {
            alert("Fail.");
        }
    });
```

### Get the Access Token

See below how to get the current access token:

```javascript
const currentAccessToken = _auth.accessToken();
console.log(`Current Access Token`, currentAccessToken);
```
