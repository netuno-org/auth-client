const _service = require('@netuno/service-client');
const _auth = require('@netuno/auth-client');

_service.config({
  prefix: global.api.services.prefix
});

_auth.config({
  serviceClient: _service,
  storage: global.api.auth.storage,
  onLogin: () => { console.log("Login done."); },
  onLogout: () => { console.log("Logout done."); }
});

describe("SIMPLE", () => {
  test("LOGIN", (done) => {
    _auth.login({
      ...global.api.auth.login,
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
            done();
          },
          fail: (e) => {
            console.error("Service Error", e);
            done('Service Error: '+ JSON.stringify(e));
          }
        });
      },
      fail: (fail)=> {
        console.error("Auth Error", e);
        done('Auth Error: '+ JSON.stringify(e));
      }
    });
  });
  /*
  for (const method of ['get', 'post', 'patch', 'put', 'delete']) {
    test(method, (done) => {
      _service({
        method,
        url: "/simple",
        data: { name: "Test Name", test: true },
        timeout: 500,
        success: (response) => {
          if (response.text) {
            console.log("Service Response", response.text);
          }
          if (response.json) {
            console.log("Service Response", response.json);
          }
          done();
        },
        fail: (e) => {
          console.log("Service Error", e);
          done('Service Error: '+ JSON.stringify(e));
        }
      });
    });
  }*/
});
