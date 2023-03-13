import _service from '@netuno/service-client';
import _auth from '@netuno/auth-client';

import config from './config.json' assert { type: 'json' };

_service.config({
	prefix: config.api.services.prefix
});

_auth.config({
    serviceClient: _service,
    storage: config.api.auth.storage,
    onLogin: () => { console.log("Login done."); },
    onLogout: () => { console.log("Logout done."); }
});

_auth.login({
    ...config.api.auth.login,
    success: ()=> {
        _service({
            method: "GET",
            url: "/simple",
            timeout: 500,
            success: (response) => {
                if (response.text) {
                    console.log("Service Response", response.text);
                }
                if (response.json) {
                    console.log("Service Response", response.json);
                }
            },
            fail: (e) => {
                console.error("Service Error", e);
            }
        });
    },
    fail: (fail)=> {
        console.error("Auth Error", e);
    }
});
