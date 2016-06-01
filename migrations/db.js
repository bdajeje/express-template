'use strict'

let path = require('path');
process.env['MYPROJECT_CONFIG_DIR'] = path.join(__dirname, '../conf/');

let mongoose      = require('mongoose'),
    Configuration = require('./configuration');

mongoose.connect(`mongodb://${Configuration['mongo']['address']}/${Configuration['mongo']['database']}`);
mongoose.connection.on('error', function(error) { throw error; });
