const fetch = require('node-fetch');

const sandboxUrl = "https://api.sandbox.wealthsimple.com/v1";

const paramsReducer = (accumulator, currentValue) => accumulator + currentValue + "&";

const buildUrlParams = (params) => {
  return Object.keys(params).map(key=>key + "=" + params[key]).reduce(paramsReducer, "?");
}

const request = (appCredentials, api, token, params, body) => {
  const postParams = buildUrlParams(Object.assign({}, appCredentials, params));
  return fetch(sandboxUrl + api.url + postParams, {
    method: api.method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body)
  })
  .then(response => response.json());
}

const healthCheck = request({}, {url:'/healthcheck', method:"GET"});

/* AUTHENTICATION */
const tokenExchange = (appCredentials) => {
  return (code) => request(appCredentials, {url:'/oauth/token', method:"POST"}, "", {grant_type: "authorization_code", code: code});
}

const tokenRefresh = (appCredentials) => {
  return (refreshToken) => request(appCredentials, {url:'/oauth/token', method:"POST"}, "", {grant_type: "refresh_token", refresh_token: refreshToken});
}



module.exports = {
  appId(appCredentials) {
    if (typeof appCredentials.client_id === "string" && typeof appCredentials.client_secret === "string" && typeof appCredentials.redirect_uri === "string") {
      return {
        healthCheck: healthCheck,
        /* AUTH */
        tokenExchange: tokenExchange(appCredentials),
        tokenRefresh: tokenRefresh(appCredentials),
      };
    } else {
      console.log("Credentials:", appCredentials);
      throw new Error("Invalid Wealthsimple app credentials");
    }

  }
}
