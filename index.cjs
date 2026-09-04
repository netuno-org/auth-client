const extend = require('just-extend');
const _service = require('@netuno/service-client');

const isNode = typeof window === 'undefined' && typeof __webpack_require__ === 'undefined';

let nodeFS = null;

if (isNode) {
    nodeFS = eval(`require('fs')`);
}

const config = {
    serviceClient: null,
    prefix: '',
    url: '_auth',
    autoLoadServiceHeaders: true,
    autoRefreshToken: true,
    storage: isNode ? '.auth.json' : 'session',
    login: {
        usernameKey: 'username',
        passwordKey: 'password',
        altchaKey: 'altcha',
        data: (data) => {
            return data;
        },
        success: (data) => { },
        fail: (data) => { }
    },
    refreshToken: {
        parameterKey: 'refresh_token',
        data: (data) => {
            return data;
        },
        success: (data) => { },
        fail: (data) => { }
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
        load: (settings, data) => {
            if (data && (settings.token.resultKey == null || data[settings.token.resultKey])
                && (settings.token.expiresInKey != null || data[settings.token.expiresInKey] > 0)
                && data[settings.token.accessTokenKey]
                && data[settings.token.refreshTokenKey]
                && (data[settings.token.tokenTypeKey] == null || data[settings.token.tokenTypeKey])) {
                if (data[settings.token.tokenTypeKey] == null) {
                    token_type = settings.token.tokenTypeDefault;
                } else {
                    token_type = data[settings.token.tokenTypeKey];
                }
                if (data[settings.token.expiresInKey] == null) {
                    token_expires_in = settings.token.expiresInDefault;
                } else {
                    token_expires_in = data[settings.token.expiresInKey];
                }
                if (data[settings.token.loadedInKey] == null) {
                    token_loaded_in = new Date().getTime();
                    data[settings.token.loadedInKey] = token_loaded_in;
                } else {
                    token_loaded_in = data[settings.token.loadedInKey];
                }
                if (settings.autoLoadServiceHeaders) {
                    (settings.serviceClient || _service).config({
                        headers: {
                            "Authorization": `${token_type} ${data.access_token}`
                        }
                    });
                }
                let isNewLogin = token == null;
                token = data;
                if (isNode) {
                    if (!!settings.storage) {
                        nodeFS.writeFileSync(settings.storage, JSON.stringify(token));
                    }
                } else {
                    if (settings.storage == 'local') {
                        localStorage.setItem(settings.token.storageKey, JSON.stringify(token));
                    } else {
                        sessionStorage.setItem(settings.token.storageKey, JSON.stringify(token));
                    }
                }
                if (isNewLogin) {
                    settings.onLogin();
                }
                return true;
            } else {
                return false;
            }
        },
        unload: (settings, data) => {
            if (settings.autoLoadServiceHeaders) {
                (settings.serviceClient || _service).config({
                    headers: {
                        "Authorization": ""
                    }
                });
            }
            return true;
        }
    },
    onLogin: () => {},
    onLogout: () => {}
};

let token = null;
let token_type = null;
let access_expires_in = null;
let token_expires_in = null;
let token_loaded_in = null;

const _auth = (args) => {
    _auth.login(args);
};

/**
 * Get the current configuration, or update it for the authentication client.
 * @param {object} [settings] - Configuration settings (e.g., URL, storage type, callbacks).
 * @returns {object} The current (possibly updated) configuration object.
 */
_auth.config = (settings) => {
    if (!!settings) {
        extend(true, config, settings);
    }
    const newConfig = {};
    extend(true, newConfig, config);
    return newConfig;
};

/**
 * Perform login request.
 * @param {object} args - Login arguments, requiring at least 'username' and 'password'.
 */
_auth.login = (args) => {
    const settings = { username: '', password: ''};
    extend(true, settings, config);
    extend(true, settings, args);
    if (!settings.data) {
        settings.data = settings.login.data;
    }
    if (!settings.success) {
        settings.success = settings.login.success;
    }
    if (!settings.fail) {
        settings.fail = settings.login.fail;
    }
    const data = { jwt: true };
    data[settings.login.usernameKey] = settings.username;
    data[settings.login.passwordKey] = settings.password;
    if (!!settings.altcha) {
        data[settings.login.altchaKey] = settings.altcha;
    }
    (settings.serviceClient || _service)({
        url: settings.url,
        method: "POST",
        headers: {
            "Authorization": ""
        },
        data: settings.data(data),
        success: (data) => {
            if (settings.token.load(settings, data.json)) {
                settings.success(data);
            } else {
                settings.fail({error: "invalid-token", response: data });
            }
        },
        fail: (data) => {
            settings.fail(data);
        }
    });
};

/**
 * Retrieve or set the current authentication token.
 * @param {object} args - Configuration options.
 * @param {object} [newToken] - The new token object to set.
 * @returns {object} The current token object.
 */
_auth.token = (args, newToken) => {
    const settings = { };
    extend(true, settings, config);
    extend(true, settings, args);
    if (!!newToken) {
        return settings.token.load(settings, newToken);
    }
    const currentToken = {};
    extend(true, currentToken, config.token);
    if (_auth.isLogged(settings)) {
        extend(true, currentToken, token);
    }
    return currentToken;
};

/**
 * Check if the user is currently logged in.
 * @param {object} [args] - Configuration overrides.
 * @returns {boolean} True if logged in, false otherwise.
 */
_auth.isLogged = (args) => {
    const settings = { };
    extend(true, settings, config);
    extend(true, settings, args);
    if (token == null) {
        if (isNode) {
            if (!!settings.storage && nodeFS.existsSync(settings.storage)) {
                settings.token.load(settings, JSON.parse(nodeFS.readFileSync(settings.storage)));
            }
        } else {
            if (settings.storage == 'local' && localStorage.getItem(settings.token.storageKey)) {
                settings.token.load(settings, JSON.parse(localStorage.getItem(settings.token.storageKey)));
            } else if (sessionStorage.getItem(settings.token.storageKey)) {
                settings.token.load(settings, JSON.parse(sessionStorage.getItem(settings.token.storageKey)));
            }
        }
    }
    return token != null;
};

/**
 * Logout the user, clearing tokens and storage.
 * @param {object} [args] - Configuration overrides.
 */
_auth.logout = (args) => {
    const settings = { };
    extend(true, settings, config);
    extend(true, settings, args);
    if (settings.token.unload(settings, token)) {
        token = null;
        if (isNode) {
            if (!!settings.storage && nodeFS.existsSync(settings.storage)) {
                nodeFS.unlinkSync(settings.storage);
            }
        } else {
            if (settings.storage == 'local') {
                localStorage.removeItem(settings.token.storageKey);
            } else {
                sessionStorage.removeItem(settings.token.storageKey);
            }
        }
        settings.onLogout();
    }
};

/**
 * Request a new access token using the refresh token.
 * @param {object} [args] - Request configuration overrides.
 */
_auth.refreshToken = (args)=> {
    if (!_auth.isLogged()) {
        return;
    }
    const settings = { };
    extend(true, settings, config);
    extend(true, settings, args);
    if (!settings.success) {
        settings.success = settings.refreshToken.success;
    }
    if (!settings.fail) {
        settings.fail = settings.refreshToken.fail;
    }
    const data = { jwt: true };
    data[settings.refreshToken.parameterKey] = token[settings.token.refreshTokenKey];
    (settings.serviceClient || _service)({
        url: settings.url,
        method: "POST",
        headers: {
            "Authorization": ""
        },
        data: settings.refreshToken.data(data),
        success: (data) => {
            if (settings.token.load(settings, data.json)) {
                settings.success(data);
            } else {
                settings.fail({error: "invalid-refresh-token", response: data });
            }
        },
        fail: (data) => {
            settings.fail(data);
        }
    });
};

/**
 * Get the current access token string.
 * @param {object} [args] - Configuration overrides.
 * @returns {string|null} The access token string, or null if not logged in.
 */
_auth.accessToken = (args) => {
    if (_auth.isLogged(args)) {
        const settings = { };
        extend(true, settings, config);
        extend(true, settings, args);
        return token[settings.token.accessTokenKey];
    }
    return null;
};

/**
 * Internal tick loop to check token expiration and optionally refresh.
 */
_auth.tick = () => {
    if (_auth.isLogged()) {
        if (token_loaded_in + token_expires_in < new Date().getTime() - 60000) {
            if (config.autoRefreshToken) {
                const settings = { };
                extend(true, settings, config);
                settings.success = () => {
                    setTimeout(() => _auth.tick(), 250);
                };
                settings.fail = (data) => {
                    console.log("_auth.tick -> refreshToken :: failed", data);
                    _auth.logout();
                    setTimeout(() => _auth.tick(), 250);
                };
                _auth.refreshToken(settings);
                return;
            }
        }
    }
    setTimeout(() => _auth.tick(), 250);
};

if (isNode === false) {
    _auth.tick();
}

module.exports = _auth;
