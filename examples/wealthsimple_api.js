const credentials = require('./credentials');

const wsCredentials = {
  "client_id": credentials.client_id,
  "client_secret": credentials.client_secret,
  "redirect_uri": credentials.redirect_uri
};

/* For Production
const wealthsimple = require('wealthsimple-node').appId(wsCredentials, "production");
*/

/* For sandbox
const wealthsimple = require('wealthsimple-node').appId(wsCredentials, "sandbox");
*/

const wealthsimple_api = require('../index.js').appId(wsCredentials, "sandbox");

module.exports = wealthsimple_api;
