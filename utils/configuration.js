'use strict'

let fs      = require('fs'),
    path    = require('path'),
    Logging = require('./logging');

 // Get configuration folder from environment if defined
const config_dir = process.env['MYPROJECT_CONFIG_DIR'];
Logging.info(`Getting configuration from: ${config_dir}`);

// Read global configuration
let conf = null;
try { conf = JSON.parse( fs.readFileSync(path.join(config_dir, 'app.conf'), 'UTF-8') ); }
catch(error) {
  Logging.error(`Can\'t read file: ${path.join(config_dir, 'app.conf')}`);
  process.exit();
}

module.exports = conf;
