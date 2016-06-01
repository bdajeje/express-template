'use strict'

let Routes   = require('./routes'),
    Security = require('../../utils/security');

module.exports = function(app) {

  // Get register view
  app.get(Routes.register.index.route, function(req, res) {
    res.render('register.ejs', {
      'password_min_length': Configuration['account']['password']['min']
    });
  });

  // Post register form
  app.post(Routes.register.index.route, Security.validateRouteParams(Routes.register.index), function(req, res, next) {

  });

  // Validate account
  app.get(Routes.register.validation.route, Security.validateRouteParams(Routes.register.validation), function(req, res) {

  });
}
