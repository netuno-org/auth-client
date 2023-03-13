const _service = require('@netuno/service-client');

const _auth = require('@netuno/auth-client');

const config = require('./config.json');

const testCall = require('./nodejs-test-call');

_service.config({
	prefix: config.api.services.prefix
});

_auth.config({
    serviceClient: _service,
    storage: config.api.auth.storage,
    onLogin: () => { console.log("Login done."); },
    onLogout: () => { console.log("Logout done."); }
});

testCall();
