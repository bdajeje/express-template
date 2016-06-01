'use strict'

let localStrategy = require('passport-local').Strategy,
    Security      = require('../../utils/security'),
    Routing       = require('../../utils/routing'),
    User          = require('../../models/user'),
    Routes        = require('../routes/routes');

module.exports = function(passport, app) {

  // Used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  // Used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(error, user) {
      done(error, user);
    });
  });

  passport.use(new localStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, email, password, done) {
      // Validate email
      if(!Security.isEmail(email))
        return done(null, false, req.flash('error', req.__('error_email_invalid')));

      User.findByEmail(email, function(user) {
        let error = null;
        if(!user) {
          error = {key: 'error_wrong_authentication', placeholders: {url: Routing.generate(Routes.lost_password.index.route)}};
        }
        else if(!user.isCorrectPassword(password)) {
          error = {key: 'error_wrong_authentication', placeholders: {url: Routing.generate(Routes.lost_password.index.route)}};
        }
        else if(!user.isValidAccount()) {
          if(user.status == User.Status.WaitingValidation)
            error = {key: 'error_account_not_validated'};
          else
            error = {key: 'error_account_too_many_fail_login'};
        }

        if(error)
          return done(null, false, req.flash('error', req.__(error.key, error.placeholders)));

        // Everything's good, update user last login
        user.loginSuccess(req);

        return done(null, user);
      })
    })
  );
};
