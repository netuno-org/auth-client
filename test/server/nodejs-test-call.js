const _service = require('@netuno/service-client');
const _auth = require('@netuno/auth-client');
const config = require('./config.json');

console.log('SERVICE PREFIX: ', _service.config().prefix);

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
