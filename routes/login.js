'use strict'

let Routes = require('./routes');

module.exports = function(app, passport) {

  app.get(Routes.login.route, function(req, res) {
    return res.render('login.ejs');
  });

  app.post(Routes.login.route, passport.authenticate('local', {
    successRedirect : Routes.dashboard.route,
    failureRedirect : Routes.login.route,
    failureFlash : true
  }));

}
