/*
  Template from https://codelabs.developers.google.com/codelabs/cloud-nodejs/#0
*/

/* Require shared configuration variables, eg. our Google Project ID */
var config = require('./config');

var coronaCases = require('./coronaCases')(config);

var counties = require('./counties')(config);

/* Require Express web framework and Express middleware */
var express = require('express');
var multer = require('multer')
var session = require('cookie-session');

/* Configure Express web application */
var app = express();
app.use(express.static('public'));
app.set('view engine', 'jade');
app.enable('trust proxy');
app.use(multer({ inMemory: true }));
app.use(session({ signed: true, secret: config.cookieSecret }));

/* Fetch all corona cases and display them */
app.get('/', function(req, res, next) {
  coronaCases.getAllCoronaCases(function(err, coronaCases, key) {
    if (err) return next(err);
    var keyCoronaCases = coronaCases.map((coronaCase) => Object.assign(coronaCase, { id: coronaCase.id || coronaCase[key].id }));
    counties.getAllCounties(function(err, counties, key) {
      if (err) return next(err);
      var keyCounties = counties.map((county) => Object.assign(county, { id: county.id || county[key].id }));
      res.render('index', { counties: keyCounties, coronaCases: keyCoronaCases, countyCases: getCountyCases(keyCounties, keyCoronaCases), user: req.session.user });
    });
  });
});

function getCountyCases(counties, coronaCases) {
  var countyTotals = [];

   counties.forEach(function(countiesElement, countiesIndex) {
    var totalCases = 0;
    var totalRecovered = 0;
    var totalDeaths = 0;

    coronaCases.forEach(function(coronaCasesElement, coronaCasesIndex) {
      if (countiesElement.countyId == coronaCasesElement.location) {
        if (coronaCasesElement.status == 1) {
          totalRecovered += 1;
        } else if (coronaCasesElement.status == 2) {
          totalDeaths += 1;
        } else {
          totalCases += 1;
        }
      }
    });
    var totalResults = {name: countiesElement.name, totalCases: totalCases, totalRecovered: totalRecovered, totalDeaths: totalDeaths};
    countyTotals.push(totalResults);
  });
  return countyTotals;
}

/* Add a new case */
app.post('/coronaCases', function(req, res, next) {
  if (! req.body.location || ! req.body.status)
    return next(new Error('Must provide location and status.'));

  var userId;
  if (req.session.user)
    userId = req.session.user.id;

  coronaCases.addCoronaCase(req.body.location, req.body.status, function(err) {
    if (err) return next(err);
    res.redirect(req.get('Referer') || '/');
  })
});

/* Run web application */
app.listen(8080);

console.log('Running on http://localhost:8080/');
