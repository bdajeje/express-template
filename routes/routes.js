'use strict'

let CommonConf    = require('../../utils/common_configuration'),
    Security      = require('../../utils/security');

const password_min_length = CommonConf['account']['password']['min'];

module.exports = {

  home: {route: '/'},

  login: {route: '/login'},

  logout: {route: '/logout'},

  register: {
    index: {
      route: '/register',
      post: {
        firstname:      {type: Security.Types.String},
        lastname:       {type: Security.Types.String},
        email:          {type: Security.Types.Email},
        password:       {type: Security.Types.String, min: password_min_length},
        password_verif: {type: Security.Types.String}
      }
    },
    validation: {
      route: '/register/validation/:user_id/:token',
      url: {
        user_id: {type: Security.Types.String},
        token: {type: Security.Types.String}
      }
    }
  }
}
