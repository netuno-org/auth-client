import extend from 'deep-extend';
import _service from '@netuno/service-client';

const config = {
    prefix: '',
    url: '_auth',
    autoLoadServiceHeaders: true,
    autoRefreshToken: true,
    login: {
        usernameKey: 'username',
        passwordKey: 'password',
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
                if (settings.autoLoadServiceHeaders) {
                    _service.config({
                        headers: {
                            "Authorization": `${token_type} ${data.access_token}`
                        }
                    });
                }
                let isNewLogin = token == null;
                token = data;
                sessionStorage.setItem(settings.token.storageKey, JSON.stringify(token));
                token_loaded_in = new Date().getTime();
                if (isNewLogin) {
                    settings.onLogin();
                }
                return true;
            } else {
                return false;
            }
        },
        unload: (settings, data) => {
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

_auth.config = (settings) => {
    extend(config, settings);
};

_auth.login = (args)=> {
    const settings = { username: '', password: ''};
    extend(settings, config);
    extend(settings, args);
    if (!settings.success) {
        settings.success = settings.login.success;
    }
    if (!settings.fail) {
        settings.fail = settings.login.fail;
    }
    const data = { jwt: true };
    data[settings.login.usernameKey] = settings.username;
    data[settings.login.passwordKey] = settings.password;
    _service({
        url: settings.url,
        method: "POST",
        data: settings.login.data(data),
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

_auth.isLogged = (args) => {
    const settings = { };
    extend(settings, config);
    extend(settings, args);
    if (token == null && sessionStorage.getItem(settings.token.storageKey)) {
        settings.token.load(settings, JSON.parse(sessionStorage.getItem(settings.token.storageKey)));
    }
    return token != null;
};

_auth.logout = (args) => {
    const settings = { };
    extend(settings, config);
    extend(settings, args);
    if (settings.token.unload(settings, token)) {
        token = null;
        sessionStorage.removeItem(settings.token.storageKey);
        settings.onLogout();
    }
};

_auth.refreshToken = (args)=> {
    if (!_auth.isLogged()) {
        return;
    }
    const settings = { };
    extend(settings, config);
    extend(settings, args);
    if (!settings.success) {
        settings.success = settings.refreshToken.success;
    }
    if (!settings.fail) {
        settings.fail = settings.refreshToken.fail;
    }
    const data = { jwt: true };
    data[settings.refreshToken.parameterKey] = token[settings.token.refreshTokenKey];
    _service({
        url: settings.url,
        method: "POST",
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

_auth.tick = () => {
    if (_auth.isLogged()) {
        if (token_loaded_in + token_expires_in < new Date().getTime() - 60000) {
            if (config.autoRefreshToken) {
                const settings = { };
                extend(settings, config);
                settings.success = () => {
                    window.setTimeout(() => _auth.tick(), 250);
                };
                settings.fail = (data) => {
                    console.log("_auth.tick -> refreshToken :: failed", data);
                    _auth.logout();
                    window.setTimeout(() => _auth.tick(), 250);
                };
                _auth.refreshToken(settings);
                return;
            }
        }
    }
    window.setTimeout(() => _auth.tick(), 250);
};

_auth.tick();

export default _auth;
