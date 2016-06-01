'use strict'

let Configuration = require('./configuration');

const port = Configuration['server']['port'] ? `:${Configuration['server']['port']}` : '';
const host = `https://${Configuration["server"]["domain"] + port}`;

module.exports = {
  generate: function(route, placeholders, generate_full_address) {
    let result = route;

    for(const placeholder in placeholders)
      result = result.replace(':' + placeholder, encodeURIComponent(placeholders[placeholder]));

    if(generate_full_address)
      result = `${host}${result}`;

    return result;
  }
}
