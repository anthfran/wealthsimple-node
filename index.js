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

/* USERS */
const createUser = (appCredentials) => {
  return (body) => request(appCredentials, {url:'/users', method:"POST"}, "", {}, body);
}
const listUsers = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/users', method:"GET"}, token, params);
}

const getUser = (appCredentials) => {
  return (token, userId) => request(appCredentials, {url:'/users/' + userId, method:"GET"}, token);
}

/* PEOPLE */
const createPerson = (appCredentials) => {
  return (token, body) => request(appCredentials, {url:'/people', method:"POST"}, token, {}, body);
}
const listPeople = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/people', method:"GET"}, token, params);
}

const getPerson = (appCredentials) => {
  return (token, personId) => request(appCredentials, {url:'/people/' + personId, method:"POST"}, token);
}

const updatePerson = (appCredentials) => {
  return (token, personId) => request(appCredentials, {url:'/people/' + personId, method:"PATCH"}, token);
}

/* TRUSTS */
/* UNIMPLEMENTED */

/* CORPORATIONS */
/* UNIMPLEMENTED */

/* ACCOUNTS */
const createAccount = (appCredentials) => {
  return (token, body) => request(appCredentials, {url:'/accounts', method:"POST"}, token, {}, body);
}

const listAccounts = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/accounts', method:"GET"}, token, params);
}

const getAccount = (appCredentials) => {
  return (token, account) => request(appCredentials, {url:'/accounts/' + account, method:"GET"}, token);
}

const getAccountTypes = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/accounts/account_types', method:"GET"}, token, params);
}

/* DAILY VALUES */
const getDailyValues = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/daily_values/', method:"GET"}, token, params);
}

/* PROJECTIONS */
const getProjection = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/projections', method:"GET"}, token, params);
}


/* BANK ACCOUNTS */
const listBankAccounts = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/bank_accounts', method:"GET"}, token, params);
}

/* DEPOSITS */
const createDeposit = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/deposits', method:"POST"}, token, params);
}

const listDeposits = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/deposits', method:"GET"}, token, params);
}

const getDeposits = (appCredentials) => {
  return (token, depositId, params) => request(appCredentials, {url:'/deposits/' + depositId, method:"GET"}, token, params);
}


module.exports = {
  appId(appCredentials) {
    if (typeof appCredentials.client_id === "string" && typeof appCredentials.client_secret === "string" && typeof appCredentials.redirect_uri === "string") {
      return {
        healthCheck: healthCheck,
        /* AUTH */
        tokenExchange: tokenExchange(appCredentials),
        tokenRefresh: tokenRefresh(appCredentials),
        /* USERS */
        createUser: createUser(appCredentials),
        listUsers: listUsers(appCredentials),
        getUser: getUser(appCredentials),
        /* ACCOUNTS */
        listAccounts: listAccounts(appCredentials),
        getAccount: getAccount(appCredentials),
        /* DAILY VALUES */
        getDailyValues: getDailyValues(appCredentials),
        /* PROJECTIONS */
        getProjection: getProjection(appCredentials),
        /* BANK ACCOUNTS */
        listBankAccounts: listBankAccounts(appCredentials),
        /* DEPOSITS */
        createDeposit: createDeposit(appCredentials),
        listDeposits: listDeposits(appCredentials),
        getDeposits: getDeposits(appCredentials),
      };
    } else {
      console.log("Credentials:", appCredentials);
      throw new Error("Invalid Wealthsimple app credentials");
    }

  }
}
