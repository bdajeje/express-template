'use strict'

let bcrypt = require('bcrypt-nodejs'),
    Schema = require('mongoose').Schema;

module.exports = {

  findByUser: function(user_id, callback) {
    return this.findOne({user_id: user_id}, function(error, result) {
      if(error)
        throw error;

      callback(result);
    });
  },

  findByID: function(id, callback) {
    return this.findById(id, function(error, result) {
      if(error)
        throw error;

      callback(result);
    });
  },

  findByEmail: function(email, callback) {
    return this.findOne({email: email}, function(error, result) {
      if(error)
        throw error;

      callback(result);
    });
  },

  findByStatus: function(status, callback) {
    return this.find({status: status}, function(error, results) {
      if(error)
        throw error;

      callback(results);
    });
  },

  removeByUser: function(user_id, callback) {
    this.remove({user_id: user_id}, function(error) {
      if(error)
        throw error;

      if(callback)
        callback();
    });
  },

  isCorrectPassword: function(input) {
    return bcrypt.compareSync(input, this.password);
  },

  setPassword: function(clear_password) {
    this.password = bcrypt.hashSync(clear_password, null, null);
  },

}
