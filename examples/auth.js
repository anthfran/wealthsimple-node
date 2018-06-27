const wealthsimple = require('./wealthsimple_api');

/* Token Exchange */
wealthsimple.tokenExchange(authCode)
.then(response => {
  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    created_at: response.created_at,
    expires_in: response.expires_in
  }
})
.then(tokens => {
  // store tokens
})
.catch(error => {
  // do something with error
});

/* Token Refresh */
wealthsimple.tokenRefresh(tokens)
.then(response => {
  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    created_at: response.created_at,
    expires_in: response.expires_in
  }
})
.then(tokens => {
  // store tokens
});

/* Refresh Tokens if Epired */
wealthsimple.refreshTokenIfExpired(tokens)
.then(refreshed => {
  if (tokens.access_token !== refreshed.access_token) {
    // store new tokens
  }
  let params = {}
  return wealthsimple.listAccounts(tokens, params);
})
.catch(error => {
  // do something with error
});
