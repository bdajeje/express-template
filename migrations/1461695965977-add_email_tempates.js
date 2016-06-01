'use strict'

let db    = require('./db');

exports.up = function(next) {
  let email_en = new Email({
    name    : 'nani',
    language: 'en',
    subject : 'Some subject',
    content : 'Some content'
  });

  email_en.save(next);
};

exports.down = function(next) {
  Email.remove({
    name: 'nani'
  }, next);
};
