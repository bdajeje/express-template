'use strict'

const email_regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

/*! Types of security validation */
const Types = {
  Email: 'email',
  String: 'string',
  Number: 'number'
};

let validateType = function(type, value) {
  switch(type) {
    case Types.Email: return isEmail(value);
    case Types.Number: return !isNaN(value);
  }

  return true;
}

let validateParams = function(requirements, data, decode) {
  if(!requirements)
    return null;

  // Validate URL parameters
  for( const param_name in requirements ) {
    const param_value = decode ? decodeURIComponent(data[param_name]) : data[param_name];
    const param_requirements = requirements[param_name];

    // No param at all ? error
    if(!param_value || param_value.length == 0) {
      // Optional parameter's not here - ignore
      if(param_requirements.required === false)
        continue;

      return {key: 'error_invalid_value', placeholders: {input: param_name}};
    }

    // Validate param type
    if(!validateType(param_requirements.type, param_value))
      return {key: 'error_invalid_value', placeholders: {input: param_name}};

    // Validate min length
    if(param_requirements.min && param_value.length < param_requirements.min)
      return {key: 'error_min_length', placeholders: {input: param_name, length: param_requirements.min}};

    // Validate param restricted values (if needed)
    const restricted_values = param_requirements.values;
    if(restricted_values && restricted_values.indexOf(param_value) == -1)
      return {key: 'error_invalid_value', placeholders: {input: param_name}};
  }

  return null;
}

let validateRouteParams = function(route) {
  return function(req, res, next) {
    // First validate the URL parameters
    let error = validateParams(route.url, req.params, true);
    if(error) {
      req.flash('error', req.__(error.key, error.placeholders));
      return res.redirect(req.previous_url);
    }

    // Then validate request parameters (GET or POST)
    error = (req.method == 'GET') ? validateParams(route.get, req.query, false) :
                                    validateParams(route.post, req.body, false);
    if(error) {
      req.flash('error', req.__(error.key, error.placeholders));
      return res.redirect(req.previous_url);
    }

    next();
  }
}

let isEmail = function(input) {
  return email_regex.test(input);
}

let extractIP = function(req) {
  if(!req)
    return 'unknown';

  return req.ip || 'unknown';
}

module.exports = {
  Types: Types,
  validateType: validateType,
  validateParams: validateParams,
  validateRouteParams: validateRouteParams,
  isEmail: isEmail,
  extractIP: extractIP
}
