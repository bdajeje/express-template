'use strict'

let Routes = require('./routes');

module.exports = function(app) {

  app.get(Routes.home.route, function(req, res) {
    res.render('home.ejs');
  });

}
