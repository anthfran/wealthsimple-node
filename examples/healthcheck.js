const wealthsimple = require('./wealthsimple_api');

wealthsimple.healthcheck()
.then(health => {
  if (health.status === 'good') {
    // do something with
  } else {
    throw "Wealthsimple API Healthcheck fail"
  }
})
.catch(error => console.error(error));
