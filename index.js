const fetch = require('node-fetch');
const queryString = require('query-string');

const sandboxUrl = "https://api.sandbox.wealthsimple.com/v1";

const request = (api, token, params, body) => {
  const postParams = queryString.stringify(params);
  //debug logging
  console.log("url:", sandboxUrl + api.url + "?" + postParams);
  if (body) console.log("body:", JSON.stringify(body));

  return fetch(sandboxUrl + api.url + "?" + postParams, {
    method: api.method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body)
  })
  .then(response => {
    return response.json()
  });
}

// const healthCheck = request({}, {url:'/healthcheck', method:"GET"});

/**
 * Exchanges an auth code for OAuth2 tokens
 * @param {String} code - Auth string from Wealthsimple redirect
 * @returns {Promise} Fetch promise which will resolve containing OAuth2 Tokens
 * @example
 * wealthsimple.tokenExchange(authCode).then(response=>console.log(response));
 */
const tokenExchange = (appCredentials) => {
  return (code) => {
    let postParams = Object.assign({}, appCredentials, {grant_type: "authorization_code", code: code});
    return request({url:'/oauth/token', method:"POST"}, "", postParams);
  }
}

/**
 * Refreshes OAuth2 tokens
 * @param {String} refreshToken - Refresh Token
 * @returns {Promise} Fetch promise which will resolve containing OAuth2 Tokens
 * @example
 * wealthsimple.tokenRefresh(refreshToken).then(response=>console.log(response));
 */
const tokenRefresh = (appCredentials) => {
  return (refreshToken) => {
    let postParams = Object.assign({}, appCredentials, {grant_type: "refresh_token", refresh_token: refreshToken});
    return request({url:'/oauth/token', method:"POST"}, "", postParams);
  }
}

/**
 * Create a User
 * https://developers.wealthsimple.com/#operation/Create%20User
 *
 * @param {Object} body
 * @returns {Promise} Fetch promise which will resolve with newly created user
 * @example
 * wealthsimple.createUser(body).then(response=>console.log(response));
 */
const createUser = (appCredentials) => {
  return (body) => request({url:'/users', method:"POST"}, "", appCredentials, body);
}

/**
 * List Users
 * https://developers.wealthsimple.com/#operation/List%20Users
 * This API will return a list of Users scoped by the authorization credentials.
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} [params] - See Wealthsimple website for an example of the request parameters
 * @returns {Promise} Fetch promise which will resolve with newly created user
 * @example
 * wealthsimple.listUsers(token).then(response=>console.log(response));
 *
 * @example
 * let params = { limit: 25, offset: 50, created_before: "2017-06-21"};
 * wealthsimple.listUsers(token, params).then(response=>console.log(response));
 */
const listUsers = () => {
  return (token, params) => request({url:'/users', method:"GET"}, token, params);
}

/**
 * Get User
 * https://developers.wealthsimple.com/#operation/Get%20User
 *
 * @param {String} token - OAuth token for a user
 * @param {String} userId - Example "user-12398ud"
 *
 * @returns {Promise} Fetch promise which will resolve with user info
 * @example
 * wealthsimple.getUser(token, userId).then(response=>console.log(response));
 */
const getUser = () => {
  return (token, userId) => request({url:'/users/' + userId, method:"GET"}, token);
}

/**
 * Create Person
 * https://developers.wealthsimple.com/#operation/Create%20Person
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} body - See Wealthsimple website for an example of the request body
 * @returns {Promise} Fetch promise which will resolve with the created Person
 * @example
 * wealthsimple.createPerson(token, body).then(response=>console.log(response));
 */
const createPerson = (appCredentials) => {
  return (token, body) => request(appCredentials, {url:'/people', method:"POST"}, token, {}, body);
}
/**
 * List People
 * https://developers.wealthsimple.com/#operation/List%20People
 * This API will return a list of People scoped by the authorization credentials.
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} params - See Wealthsimple website for an example of the request parameters
 * @returns {Promise} Fetch promise which will resolve with the list of people
 * @example
 * wealthsimple.createPerson(token, body).then(response=>console.log(response));
 */
const listPeople = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/people', method:"GET"}, token, params);
}

/**
 * Get Person
 * https://developers.wealthsimple.com/#operation/Get%20Person
 * Get a Person entity if you know the person_id and the current credentials have access to the Person.
 *
 * @param {String} token - OAuth token for a user
 * @param {String} personId - Example "person-12398ud"
 * @returns {Promise} Fetch promise which will resolve with the Person details
 * @example
 * wealthsimple.getPerson(token, "person-12398ud").then(response=>console.log(response));
 */
const getPerson = (appCredentials) => {
  return (token, personId) => request(appCredentials, {url:'/people/' + personId, method:"POST"}, token);
}
/**
 * Update Person
 * https://developers.wealthsimple.com/#operation/Update%20Person
 * You can add/remove information to the Person entity as the information becomes available using this API. To remove a previously set attribute, set the value to null. Attributes that are not mentioned in the request payload will leave the attribute unchanged in the Person entity.
 *
 * @param {String} token - OAuth token for a user
 * @param {String} personId - Example "person-12398ud"
 * @param {Object} body - See Wealthsimple website for an example of the body
 * @returns {Promise} Fetch promise which will resolve with the updated Person
 * @example
 * wealthsimple.updatePerson(token, "person-12398ud", body).then(response=>console.log(response));
 */
const updatePerson = (appCredentials) => {
  return (token, personId, body) => request(appCredentials, {url:'/people/' + personId, method:"PATCH"}, token, {}, body);
}

/**
 * Create Account
 * https://developers.wealthsimple.com/#operation/Create%20Account
 * You can add/remove information to the Person entity as the information becomes available using this API. To remove a previously set attribute, set the value to null. Attributes that are not mentioned in the request payload will leave the attribute unchanged in the Person entity.
 *
 * @param {String} token - OAuth token for a user
 * @param {String} personId - Example "person-12398ud"
 * @param {Object} body - See Wealthsimple website for an example of the body
 * @returns {Promise} Fetch promise which will resolve with the created Account
 * @example
 * wealthsimple.createAccount(token, body).then(response=>console.log(response));
 */
const createAccount = (appCredentials) => {
  return (token, body) => request(appCredentials, {url:'/accounts', method:"POST"}, token, {}, body);
}

/**
 * List Accounts
 * https://developers.wealthsimple.com/#operation/List%20Accounts
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} [params] - Optional filter params, See Wealthsimple website for an example of the request parameters
 * @returns {Promise} Fetch promise which will resolve with the list of accounts
 * @example
 * wealthsimple.listAccounts(token).then(response=>console.log(response));
 * @example
 * wealthsimple.listAccounts(token,params).then(response=>console.log(response));
 */
const listAccounts = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/accounts', method:"GET"}, token, params);
}

/**
 * Get Account
 * https://developers.wealthsimple.com/#operation/Get%20Account
 *
 * @param {String} token - OAuth token for a user
 * @param {String} accountId - Account ID String
 * @returns {Promise} Fetch promise which will resolve with the account details
 * @example
 * wealthsimple.listAccounts(token).then(response=>console.log(response));
 * @example
 * wealthsimple.getAccount(token,accountId).then(response=>console.log(response));
 */
const getAccount = (appCredentials) => {
  return (token, accountId) => request(appCredentials, {url:'/accounts/' + accountId, method:"GET"}, token);
}

/**
 * Get Account Types
 * https://developers.wealthsimple.com/#operation/Get%20Account%20Types
 * Returns openable account types. If a client_id is provided it will scope the types to the client in question, otherwise it will default to the requestor
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} [params] - Optional filter params, See Wealthsimple website for an example of the request parameters
 * @returns {Promise} Fetch promise which will resolve with the account details
 * @example
 * wealthsimple.getAccountTypes(token).then(response=>console.log(response));
 * @example
 * wealthsimple.getAccountTypes(token,params).then(response=>console.log(response));
 */
const getAccountTypes = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/accounts/account_types', method:"GET"}, token, params);
}

/**
 * Get Daily Values
 * https://developers.wealthsimple.com/#operation/List%20Daily%20Values
 * Returns historical daily values for a given account. This API will only return a maximum of 365 days worth of daily values from a given start date. By default, it will return historical values for the last 30-days. The start date must occur before the end date if provided. If the difference between the start date and the end date exceeds 365 days, an error will be thrown. The number of Daily Values can be potentially prohibitively large, the results are paginated.
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} [params] - Optional filter params, See Wealthsimple website for an example of the request parameters
 * @param {Object} params.accound_id - Required account_id param
 *
 * @returns {Promise} Fetch promise which will resolve with the account daily values
 * @example
 * wealthsimple.getDailyValues(token,{ params.accound_id: "rrsp-r3e9c1w" }).then(response=>console.log(response));
 */
const getDailyValues = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/daily_values/', method:"GET"}, token, params);
}

/**
 * List Positions
 * https://developers.wealthsimple.com/#tag/Positions
 * Returns positions for a given account. This API will also allow you to retrieve historical Positions held on a given date.
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} [params] - Optional filter params, See Wealthsimple website for an example of the request parameters
 * @param {Object} params.accound_id - Required account_id param
 *
 * @returns {Promise} Fetch promise which will resolve with the account positions
 * @example
 * wealthsimple.listPositions(token,{ params.accound_id: "rrsp-r3e9c1w" }).then(response=>console.log(response));
 */
const listPositions = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/positions/', method:"GET"}, token, params);
}

/**
 * List Transactions
 * https://developers.wealthsimple.com/#operation/List%20Transactions
 * Lists all Transactions. The number of Transactions can be potentially prohibitively large, the results are paginated. By default, the API will return the 250 latest transactions in the last 30 days.
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} [params] - Optional filter params, See Wealthsimple website for an example of the request parameters
 * @param {Object} params.accound_id - Required account_id param
 *
 * @returns {Promise} Fetch promise which will resolve with the account transactions
 * @example
 * wealthsimple.listTransactions(token,{ params.accound_id: "rrsp-r3e9c1w" }).then(response=>console.log(response));
 */
const listTransactions = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/transactions/', method:"GET"}, token, params);
}

/**
 * Get Projection
 * https://developers.wealthsimple.com/#operation/Get%20Projection
 * Retrieves a projections of returns for an account based on deposits and frequency.
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} params - Projection params
 * @param {Object} params.accound_id - Required account_id param
 * @param {Object} params.amount - Required deposit amount
 * @param {Object} params.frequency - Required deposit frequency
 * @param {Object} params.start_date - Required deposit start date
 *
 * @returns {Promise} Fetch promise which will resolve with the projection
 * @example
 * wealthsimple.getProjection(token, params).then(response=>console.log(response));
 */
const getProjection = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/projections', method:"GET"}, token, params);
}


/**
 * List Bank Accounts
 * https://developers.wealthsimple.com/#operation/List%20Bank%20Accounts
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} [params] - See website for optional query params
 * @returns {Promise} Fetch promise which will resolve with list of bank accounts
 * @example
 * wealthsimple.listBankAccounts(token, params).then(response=>console.log(response));
 */
const listBankAccounts = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/bank_accounts', method:"GET"}, token, params);
}

/**
 * Create Deposit
 * https://developers.wealthsimple.com/#operation/Create%20Deposit
 * Initiates an electronic funds transfer to deposit funds to an Account from a Bank Account
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} body - Required deposit details
 * @param {Object} body.bank_account_id - The unique id of the Bank Account
 * @param {Object} body.account_id - The unique id of the Account
 * @param {Object} body.amount - Dollar amount
 * @param {Object} body.currency - Currency
 * @returns {Promise} Fetch promise which will resolve with deposit info
 * @example
 * wealthsimple.createDeposit(token, body).then(response=>console.log(response));
 */
const createDeposit = (appCredentials) => {
  return (token, body) => request({}, {url:'/deposits', method:"POST"}, token, {}, body);
}

/**
 * List Deposits
 * https://developers.wealthsimple.com/#operation/List%20Deposits
 *
 * @param {String} token - OAuth token for a user
 * @param {Object} [params] - See website for optional query params
 * @returns {Promise} Fetch promise which will resolve with deposit list
 * @example
 * wealthsimple.listDeposits(token, body).then(response=>console.log(response));
 */
const listDeposits = (appCredentials) => {
  return (token, params) => request(appCredentials, {url:'/deposits', method:"GET"}, token, params);
}

/**
 * Get Deposit
 * https://developers.wealthsimple.com/#operation/List%20Deposits
 *
 * @param {String} token - OAuth token for a user
 * @param {String} fundsTransferId - funds_transfer_id
 * @returns {Promise} Fetch promise which will resolve with a deposit entity.
 * @example
 * let fundsTransferId = "funds_transfer_id-r3e9c1w";
 * wealthsimple.getDeposit(token, fundsTransferId).then(response=>console.log(response));
 */
const getDeposit = (appCredentials) => {
  return (token, fundsTransferId) => request(appCredentials, {url:'/deposits/' + depositId, method:"GET"}, token);
}


module.exports = {
  appId(appCredentials) {
    if (typeof appCredentials.client_id === "string"
    && typeof appCredentials.client_secret === "string"
    && typeof appCredentials.redirect_uri === "string" ) {
      return {
        // healthCheck: healthCheck,
        /* AUTH */
        tokenExchange: tokenExchange(appCredentials),
        tokenRefresh: tokenRefresh(appCredentials),
        /* USERS */
        createUser: createUser(appCredentials),
        listUsers: listUsers(),
        getUser: getUser(),
        /* PEOPLE */
        listPeople: listPeople(appCredentials),
        /* ACCOUNTS */
        listAccounts: listAccounts(appCredentials),
        getAccount: getAccount(appCredentials),
        getAccountTypes: getAccountTypes(appCredentials),
        /* DAILY VALUES */
        getDailyValues: getDailyValues(appCredentials),
        /* POSITIONS */
        listPositions: listPositions(appCredentials),
        /* TRANSACTIONS */
        listTransactions: listTransactions(appCredentials),
        /* PROJECTIONS */
        getProjection: getProjection(appCredentials),
        /* BANK ACCOUNTS */
        listBankAccounts: listBankAccounts(appCredentials),
        /* DEPOSITS */
        createDeposit: createDeposit(appCredentials),
        listDeposits: listDeposits(appCredentials),
        getDeposit: getDeposit(appCredentials),
      };
    } else {
      console.log("Credentials:", appCredentials);
      throw new Error("Invalid Wealthsimple app credentials");
    }

  }
}
