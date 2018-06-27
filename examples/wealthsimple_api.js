const credentials = {
  "client_id": "XXXXX",
  "client_secret": "XXXXX",
  "redirect_uri": "https://localhost:3000/auth"
};

/* For Production
const wealthsimple = require('wealthsimple-node').appId(wsCredentials, "production");
*/

/* For sandbox */
const wealthsimple_api = require('../index.js').appId(credentials, "sandbox");

module.exports = wealthsimple_api;
