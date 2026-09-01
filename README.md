# auth-client

Authentication client for Netuno Platform services integrations using JWT (JSON Web Token).

<a href="https://www.npmjs.com/package/@netuno/auth-client"><img src="https://img.shields.io/npm/v/@netuno/auth-client.svg?style=flat" alt="npm version"></a>

See more about the [Netuno Platform](https://netuno.org/): open source, low-code, and polyglot.

This module makes it easy to support JWT authentication in browser and Node.js applications.

After the login is made, the Authorization header will be automatically loaded.

With this any `_service(...)` call will automatically be authenticated.

### Install

`npm i -S @netuno/auth-client`

### Import

`import _auth from '@netuno/auth-client';`

### Remember

After the login any `_service(...)` call will automatically be authenticated.

### Config

Defines the main events. With the ES-module build, `config` is asynchronous, so await it before immediately making an authentication request:

```javascript
await _auth.config({
    onLogin: () => { alert("Logged in!"); },
    onLogout: () => { alert("Logged out!"); }
});
```

Full configuration with default values:

```javascript
await _auth.config({
    serviceClient: null,
    prefix: '',
    url: '_auth',
    autoLoadServiceHeaders: true,
    autoRefreshToken: true,
    storage: typeof window === 'undefined' ? '.auth.json' : 'session',
    login: {
        usernameKey: 'username',
        passwordKey: 'password',
        altchaKey: 'altcha',
        data: (data) => data,
        success: (data) => {},
        fail: (data) => {}
    },
    refreshToken: {
        parameterKey: 'refresh_token',
        data: (data) => data,
        success: (data) => {},
        fail: (data) => {}
    },
    token: {
        storageKey: '_auth_token',
        resultKey: 'result',
        expiresInKey: 'expires_in',
        accessTokenKey: 'access_token',
        refreshTokenKey: 'refresh_token',
        loadedInKey: 'loaded_in',
        tokenTypeKey: 'token_type',
        expiresInDefault: null,
        tokenTypeDefault: null,
        load: (settings, data) => { /* load and persist a valid token */ },
        unload: (settings, data) => { /* clear the service Authorization header */ }
    },
    onLogin: () => {},
    onLogout: () => {}
});
```

The CommonJS build returns the configuration copy synchronously. `serviceClient` may be set to another compatible service-client function. `prefix` is retained as a compatibility setting but is not read directly by auth-client; configure the URL prefix on the selected service client.

### Public API

| API | Behavior |
| --- | --- |
| `_auth(options)` | Shorthand for `_auth.login(options)`. |
| `_auth.config([settings])` | Deep-merges settings and returns a detached copy of the effective configuration. The ES-module version returns a promise; the CommonJS version returns the copy directly. |
| `_auth.login(options)` | Sends a JWT login request. `username`, `password`, and optionally `altcha` are mapped through the configured keys. |
| `_auth.token([settings], [newToken])` | Returns a copy of the current token state. When `newToken` is supplied as the second argument, validates, loads, and persists it and returns `true` or `false`. |
| `_auth.isLogged([settings])` | Loads persisted state if necessary and reports whether a token is present. |
| `_auth.logout([settings])` | Unloads and removes the token, clears the service authorization header, and calls `onLogout`. |
| `_auth.refreshToken([options])` | Requests a replacement token when logged in. |
| `_auth.accessToken([settings])` | Returns the configured access-token field, or `null` when logged out. |
| `_auth.tick()` | Runs the browser token-expiry check and schedules the next check. It starts automatically in browser environments. |

The optional per-call settings are deep-merged over the global configuration. Callback-based service completion is used even where the ES-module wrapper itself returns a promise.

### Usage

This module depends on `@netuno/service-client`.

So the prefix url should be defined in the `_service.config({ prefix: '...' })`, like:

```javascript
_service.config({
    prefix: 'http://localhost:9000/services/'
});
```

In the global configuration (`_auth.config({...})`) or with the object passed to the service function (`_auth.login({...})`), you can set or override any configuration parameters.

In browsers, the token is stored in `sessionStorage` with the configuration key defined in `token.storageKey`. In Node.js, the default storage is the `.auth.json` file; set `storage` to another file path or to a falsy value to disable file persistence.

To store the token in the `localStorage` change the `storage` configuration to `local`:

```javascript
await _auth.config({
    storage: 'local'
});
```

### Login

With success the event `_auth.config({ onLogin: ()=> ... })` will be invoked.

The default login payload contains `jwt: true`, the configured username and password keys, and the ALTCHA field when `altcha` is supplied. `login.data` can transform that payload before it is sent. The default endpoint is `_auth`, using `POST` with an empty request authorization header.

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

### Get or Load the Token

Read a detached copy of the current token state:

Called with no second argument, `_auth.token()` returns an object — a copy of the current token state:

```javascript
const currentToken = _auth.token();
```

Called with a token response as the second argument, it loads that response using the active token-field configuration and returns a boolean (`true` on success, `false` if validation fails) — not the token object:

```javascript
const loaded = _auth.token({}, tokenResponse); // boolean
```

Loading first validates the configured result, access-token, refresh-token, token-type, and expiry fields. Only when they are all valid does it persist the token and update the selected service client's `Authorization` header (when `autoLoadServiceHeaders` is enabled), then return `true`; if validation fails it makes no changes and returns `false`.

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
