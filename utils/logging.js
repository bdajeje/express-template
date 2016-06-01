'use strict'

let winston = require('winston'),
    path    = require('path');

let logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      name: 'info-console',
      level: 'info'
    }),
    new (winston.transports.Console)({
      name: 'error-console',
      level: 'error',
      colorize: true
    }),
    new (require('winston-daily-rotate-file'))({
      name: 'error-file-rotate-daily',
      filename: path.join(__dirname, `../logs/error.log`),
      level: 'error'
    })
  ]
});

module.exports = logger;
