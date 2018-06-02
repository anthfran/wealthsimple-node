const fetch = require('node-fetch');

const sandboxUrl = "https://api.sandbox.wealthsimple.com/v1";

const paramsReducer = (accumulator, currentValue) => accumulator + currentValue + "&";

const buildUrlParams = (params) => {
  return Object.keys(params).map(key=>key + "=" + params[key]).reduce(paramsReducer, "?");
}

const request = (appCredentials, api, params) => {
  const postParams = buildUrlParams(Object.assign({}, appCredentials, params));
  // console.log(sandboxUrl + api.url + postParams);
  return fetch(sandboxUrl + api.url + postParams, {
    method: api.method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json());
}

const healthCheck = request({}, {url:'/healthcheck', method:"GET"});

const tokenExchange = (appCredentials) => {
  return (code) => request(appCredentials, {url:'/oauth/token', method:"POST"}, {grant_type: "authorization_code", code: code});
}

const tokenRefresh = (appCredentials) => {
  return (refreshToken) => request(appCredentials, {url:'/oauth/token', method:"POST"}, {grant_type: "refresh_token", refresh_token: refreshToken});
}


module.exports = {
  appId(appCredentials) {
    return {
      healthCheck: healthCheck,
      tokenExchange: tokenExchange(appCredentials),
      tokenRefresh: tokenRefresh(appCredentials),
    };
  }

}
