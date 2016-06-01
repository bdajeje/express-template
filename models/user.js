'use strict'

let mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    Common   = require('./utils/common');

const Status = {
  Validated: 'validated',
  WaitingValidation: 'waiting-validation',
  TooManyWrongAuthentication: 'too-many-wrong-authentication'
};

let schema = new Schema({
  email          : {type: String, index: true, unique: true, required: true, lowercase: true, trim: true},
  gender         : {type: String},
  firstname      : {type: String, required: true, lowercase: true, trim: true},
  lastname       : {type: String, required: true, lowercase: true, trim: true},
  password       : {type: String, required: true},
  ip             : {type: String, required: true},
  status         : {type: String, required: true, default: Status.WaitingValidation},
  language       : {type: String, default: 'en'},
  createdOn      : {type: Date, default: Date.now},
  lastConnectedOn: Date
});

schema.methods.isWaitingForValidation = function() {
  return this.status == Status.WaitingValidation;
};

schema.methods.isValidAccount = function() {
  return this.status == Status.Validated;
};

schema.methods.isTooManyWrongAuthentication = function() {
  return this.status == Status.TooManyWrongAuthentication;
};

schema.methods.getFullName = function() {
  return this.firstname.capitalize() + ' ' + this.lastname.capitalize();
};

schema.statics.findByEmail       = Common.findByEmail;
schema.statics.findByID          = Common.findByID;
schema.statics.setPassword       = Common.setPassword;
schema.methods.isCorrectPassword = Common.isCorrectPassword;

let User = mongoose.model('User', schema);
User.Status = Status;

module.exports = User;

