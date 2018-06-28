const rp = require('request-promise-native');
const HOSTS = require('./hosts');

const request = (host, api, token, params, body) => {
  const options = {
    uri: host + api.url,
    method: api.method,
    qs: params,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: body,
    json: true // Automatically parses the JSON string in the response
  };
  return rp(options)
}

const healthcheck = (host) => {
  return () => {
    return request(host, {url:'/healthcheck', method:"GET"})
  }
}

/**
 * Exchanges an auth code for OAuth2 tokens
 * @param {String} code - Auth string from Wealthsimple redirect
 * @returns {Promise} Promise which will resolve containing OAuth2 Tokens
 * @example
 * wealthsimple.tokenExchange(authCode).then(response=>console.log(response));
 */
const tokenExchange = (host, appCredentials) => {
  return (code) => {
    let postParams = Object.assign({}, appCredentials, {grant_type: "authorization_code", code: code});
    return request(host, {url:'/oauth/token', method:"POST"}, "", postParams);
  }
}

/**
 * Refreshes OAuth2 tokens
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @returns {Promise} Promise which will resolve containing OAuth2 Tokens
 * @example
 * wealthsimple.tokenRefresh(refreshToken).then(response=>console.log(response));
 */
const tokenRefresh = (host, appCredentials) => {
  return (tokens) => {
    let postParams = Object.assign({}, appCredentials, {grant_type: "refresh_token", refresh_token: tokens.refresh_token});
    return request(host, {url:'/oauth/token', method:"POST"}, "", postParams);
  }
}

/**
 * If the token is not expired, return the tokens object. Otherwise refreshes the tokens
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @returns {Promise} Promise which will resolve containing OAuth2 Tokens
 */
const refreshTokenIfExpired =  (host, appCredentials) => {
  return async (tokens) => {
    if (!_isTokenExpired(tokens)) return tokens
    else {
      console.log(tokens.refresh_token);
      let postParams = Object.assign({}, appCredentials, {grant_type: "refresh_token", refresh_token: tokens.refresh_token});
      return request(host, {url:'/oauth/token', method:"POST"}, "", postParams);
    }
  }
}

/**
 * Create a User
 * https://developers.wealthsimple.com/#operation/Create%20User
 *
 * @param {Object} body
 * @returns {Promise} Promise which will resolve with newly created user
 * @example
 * wealthsimple.createUser(body).then(response=>console.log(response));
 */
const createUser = (host, appCredentials) => {
  return (body) => request(host, {url:'/users', method:"POST"}, "", appCredentials, body);
}

/**
 * List Users
 * https://developers.wealthsimple.com/#operation/List%20Users
 * This API will return a list of Users scoped by the authorization credentials.
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} [params] - See Wealthsimple website for an example of the request parameters
 * @returns {Promise} Promise which will resolve with newly created user
 * @example
 * wealthsimple.listUsers(token).then(response=>console.log(response));
 *
 * @example
 * let params = { limit: 25, offset: 50, created_before: "2017-06-21"};
 * wealthsimple.listUsers(token, params).then(response=>console.log(response));
 */
const listUsers = (host) => {
  return (tokens, params) => request(host, {url:'/users', method:"GET"}, tokens.access_token, params);
}

/**
 * Get User
 * https://developers.wealthsimple.com/#operation/Get%20User
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {String} userId - Example "user-12398ud"
 *
 * @returns {Promise} Promise which will resolve with user info
 * @example
 * wealthsimple.getUser(token, userId).then(response=>console.log(response));
 */
const getUser = (host) => {
  return (tokens, userId) => request(host, {url:'/users/' + userId, method:"GET"}, tokens.access_token);
}

/**
 * Create Person
 * https://developers.wealthsimple.com/#operation/Create%20Person
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} body - See Wealthsimple website for an example of the request body
 * @returns {Promise} Promise which will resolve with the created Person
 * @example
 * wealthsimple.createPerson(token, body).then(response=>console.log(response));
 */
const createPerson = (host) => {
  return (tokens, body) => request(host, {url:'/people', method:"POST"}, tokens.access_token, {}, body);
}
/**
 * List People
 * https://developers.wealthsimple.com/#operation/List%20People
 * This API will return a list of People scoped by the authorization credentials.
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} params - See Wealthsimple website for an example of the request parameters
 * @returns {Promise} Promise which will resolve with the list of people
 * @example
 * wealthsimple.createPerson(token, body).then(response=>console.log(response));
 */
const listPeople = (host) => {
  return (tokens, params) => request(host, {url:'/people', method:"GET"}, tokens.access_token, params);
}

/**
 * Get Person
 * https://developers.wealthsimple.com/#operation/Get%20Person
 * Get a Person entity if you know the person_id and the current credentials have access to the Person.
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {String} personId - Example "person-12398ud"
 * @returns {Promise} Promise which will resolve with the Person details
 * @example
 * wealthsimple.getPerson(token, "person-12398ud").then(response=>console.log(response));
 */
const getPerson = (host) => {
  return (tokens, personId) => request(host, {url:'/people/' + personId, method:"POST"}, tokens.access_token);
}
/**
 * Update Person
 * https://developers.wealthsimple.com/#operation/Update%20Person
 * You can add/remove information to the Person entity as the information becomes available using this API. To remove a previously set attribute, set the value to null. Attributes that are not mentioned in the request payload will leave the attribute unchanged in the Person entity.
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {String} personId - Example "person-12398ud"
 * @param {Object} body - See Wealthsimple website for an example of the body
 * @returns {Promise} Promise which will resolve with the updated Person
 * @example
 * wealthsimple.updatePerson(token, "person-12398ud", body).then(response=>console.log(response));
 */
const updatePerson = (host) => {
  return (tokens, personId, body) => request(host, {url:'/people/' + personId, method:"PATCH"}, tokens.access_token, {}, body);
}

/**
 * Create Account
 * https://developers.wealthsimple.com/#operation/Create%20Account
 * You can add/remove information to the Person entity as the information becomes available using this API. To remove a previously set attribute, set the value to null. Attributes that are not mentioned in the request payload will leave the attribute unchanged in the Person entity.
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {String} personId - Example "person-12398ud"
 * @param {Object} body - See Wealthsimple website for an example of the body
 * @returns {Promise} Promise which will resolve with the created Account
 * @example
 * wealthsimple.createAccount(token, body).then(response=>console.log(response));
 */
const createAccount = (host) => {
  return (tokens, body) => request(host, {url:'/accounts', method:"POST"}, tokens.access_token, {}, body);
}

/**
 * List Accounts
 * https://developers.wealthsimple.com/#operation/List%20Accounts
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} [params] - Optional filter params, See Wealthsimple website for an example of the request parameters
 * @returns {Promise} Promise which will resolve with the list of accounts
 * @example
 * wealthsimple.listAccounts(token).then(response=>console.log(response));
 * @example
 * wealthsimple.listAccounts(token,params).then(response=>console.log(response));
 */
const listAccounts = (host) => {
  return (tokens, params) => request(host, {url:'/accounts', method:"GET"}, tokens.access_token, params);
}

/**
 * Get Account
 * https://developers.wealthsimple.com/#operation/Get%20Account
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {String} accountId - Account ID String
 * @returns {Promise} Promise which will resolve with the account details
 * @example
 * wealthsimple.listAccounts(token).then(response=>console.log(response));
 * @example
 * wealthsimple.getAccount(token,accountId).then(response=>console.log(response));
 */
const getAccount = (host) => {
  return (tokens, accountId) => request(host, {url:'/accounts/' + accountId, method:"GET"}, tokens.access_token);
}

/**
 * Get Account Types
 * https://developers.wealthsimple.com/#operation/Get%20Account%20Types
 * Returns openable account types. If a client_id is provided it will scope the types to the client in question, otherwise it will default to the requestor
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} [params] - Optional filter params, See Wealthsimple website for an example of the request parameters
 * @returns {Promise} Promise which will resolve with the account details
 * @example
 * wealthsimple.getAccountTypes(token).then(response=>console.log(response));
 * @example
 * wealthsimple.getAccountTypes(token,params).then(response=>console.log(response));
 */
const getAccountTypes = (host) => {
  return (tokens, params) => request(host, {url:'/accounts/account_types', method:"GET"}, tokens.access_token, params);
}

/**
 * Get Daily Values
 * https://developers.wealthsimple.com/#operation/List%20Daily%20Values
 * Returns historical daily values for a given account. This API will only return a maximum of 365 days worth of daily values from a given start date. By default, it will return historical values for the last 30-days. The start date must occur before the end date if provided. If the difference between the start date and the end date exceeds 365 days, an error will be thrown. The number of Daily Values can be potentially prohibitively large, the results are paginated.
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} [params] - Optional filter params, See Wealthsimple website for an example of the request parameters
 * @param {Object} params.accound_id - Required account_id param
 *
 * @returns {Promise} Promise which will resolve with the account daily values
 * @example
 * wealthsimple.getDailyValues(token,{ params.accound_id: "rrsp-r3e9c1w" }).then(response=>console.log(response));
 */
const getDailyValues = (host) => {
  return (tokens, params) => request(host, {url:'/daily_values/', method:"GET"}, tokens.access_token, params);
}

/**
 * List Positions
 * https://developers.wealthsimple.com/#tag/Positions
 * Returns positions for a given account. This API will also allow you to retrieve historical Positions held on a given date.
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} [params] - Optional filter params, See Wealthsimple website for an example of the request parameters
 * @param {Object} params.accound_id - Required account_id param
 *
 * @returns {Promise} Promise which will resolve with the account positions
 * @example
 * wealthsimple.listPositions(token,{ params.accound_id: "rrsp-r3e9c1w" }).then(response=>console.log(response));
 */
const listPositions = (host) => {
  return (tokens, params) => request(host, {url:'/positions/', method:"GET"}, tokens.access_token, params);
}

/**
 * List Transactions
 * https://developers.wealthsimple.com/#operation/List%20Transactions
 * Lists all Transactions. The number of Transactions can be potentially prohibitively large, the results are paginated. By default, the API will return the 250 latest transactions in the last 30 days.
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} [params] - Optional filter params, See Wealthsimple website for an example of the request parameters
 * @param {Object} params.accound_id - Required account_id param
 *
 * @returns {Promise} Promise which will resolve with the account transactions
 * @example
 * wealthsimple.listTransactions(token,{ params.accound_id: "rrsp-r3e9c1w" }).then(response=>console.log(response));
 */
const listTransactions = (host) => {
  return (tokens, params) => request(host, {url:'/transactions/', method:"GET"}, tokens.access_token, params);
}

/**
 * Get Projection
 * https://developers.wealthsimple.com/#operation/Get%20Projection
 * Retrieves a projections of returns for an account based on deposits and frequency.
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} params - Projection params
 * @param {Object} params.accound_id - Required account_id param
 * @param {Object} params.amount - Required deposit amount
 * @param {Object} params.frequency - Required deposit frequency
 * @param {Object} params.start_date - Required deposit start date
 *
 * @returns {Promise} Promise which will resolve with the projection
 * @example
 * wealthsimple.getProjection(token, params).then(response=>console.log(response));
 */
const getProjection = (host) => {
  return (tokens, params) => request(host, {url:'/projections', method:"GET"}, tokens.access_token, params);
}


/**
 * List Bank Accounts
 * https://developers.wealthsimple.com/#operation/List%20Bank%20Accounts
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} [params] - See website for optional query params
 * @returns {Promise} Promise which will resolve with list of bank accounts
 * @example
 * wealthsimple.listBankAccounts(token, params).then(response=>console.log(response));
 */
const listBankAccounts = (host) => {
  return (tokens, params) => request(host, {url:'/bank_accounts', method:"GET"}, tokens.access_token, params);
}

/**
 * Create Deposit
 * https://developers.wealthsimple.com/#operation/Create%20Deposit
 * Initiates an electronic funds transfer to deposit funds to an Account from a Bank Account
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} body - Required deposit details
 * @param {Object} body.bank_account_id - The unique id of the Bank Account
 * @param {Object} body.account_id - The unique id of the Account
 * @param {Object} body.amount - Dollar amount
 * @param {Object} body.currency - Currency
 * @returns {Promise} Promise which will resolve with deposit info
 * @example
 * wealthsimple.createDeposit(token, body).then(response=>console.log(response));
 */
const createDeposit = (host) => {
  return (tokens, body) => request(host, {url:'/deposits', method:"POST"}, tokens.access_token, {}, body);
}

/**
 * List Deposits
 * https://developers.wealthsimple.com/#operation/List%20Deposits
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {Object} [params] - See website for optional query params
 * @returns {Promise} Promise which will resolve with deposit list
 * @example
 * wealthsimple.listDeposits(token, body).then(response=>console.log(response));
 */
const listDeposits = (host) => {
  return (tokens, params) => request(host, {url:'/deposits', method:"GET"}, tokens.access_token, params);
}

/**
 * Get Deposit
 * https://developers.wealthsimple.com/#operation/List%20Deposits
 *
 * @param {Object} tokens - Tokens object from Wealthsimple
 * @param {String} fundsTransferId - funds_transfer_id
 * @returns {Promise} Promise which will resolve with a deposit entity.
 * @example
 * let fundsTransferId = "funds_transfer_id-r3e9c1w";
 * wealthsimple.getDeposit(token, fundsTransferId).then(response=>console.log(response));
 */
const getDeposit = (host) => {
  return (tokens, fundsTransferId) => request(host, {url:'/deposits/' + depositId, method:"GET"}, tokens.access_token);
}

const useHost = (env) => {
  if (env === "sandbox" || env === "production") return HOSTS[env]
  else return HOSTS["sandbox"]
}

module.exports = {
  appId(appCredentials, env) {
    if (typeof appCredentials.client_id === "string"
    && typeof appCredentials.client_secret === "string"
    && typeof appCredentials.redirect_uri === "string") {
      let host = useHost(env);
      return {
        healthcheck: healthcheck(host),
        /* AUTH */
        tokenExchange: tokenExchange(host, appCredentials),
        tokenRefresh: tokenRefresh(host, appCredentials),
        refreshTokenIfExpired: refreshTokenIfExpired(host, appCredentials),
        /* USERS */
        createUser: createUser(host, appCredentials),
        listUsers: listUsers(host),
        getUser: getUser(host),
        /* PEOPLE */
        listPeople: listPeople(host),
        /* ACCOUNTS */
        listAccounts: listAccounts(host),
        getAccount: getAccount(host),
        getAccountTypes: getAccountTypes(host),
        /* DAILY VALUES */
        getDailyValues: getDailyValues(host),
        /* POSITIONS */
        listPositions: listPositions(host),
        /* TRANSACTIONS */
        listTransactions: listTransactions(host),
        /* PROJECTIONS */
        getProjection: getProjection(host),
        /* BANK ACCOUNTS */
        listBankAccounts: listBankAccounts(host),
        /* DEPOSITS */
        createDeposit: createDeposit(host),
        listDeposits: listDeposits(host),
        getDeposit: getDeposit(host),
      };
    } else {
      console.log("Credentials:", appCredentials);
      throw new Error("Invalid Wealthsimple app credentials");
    }

  }
}


/**
 * Is Token Expired
 * Determines if an access tokens is expired
 *
 * @param {Number} expiry - Datetime of when the token expires
 * @returns {Boolean} Returns true if the token is epxired
 */
const _isTokenExpired = (tokens) => {
  const expiry = 1000*(tokens.created_at + tokens.expires_in);
  if (expiry < Date.now()) return true
  else return false
}
