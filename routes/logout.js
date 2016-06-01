'use strict'

let Routes = require('./routes');

module.exports = function(app) {

  app.get(Routes.logout.route, function(req, res) {
    req.logout();
    res.redirect(Routes.home.route);
  });

}
