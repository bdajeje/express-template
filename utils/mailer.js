'use strict'

let mailer        = require('express-mailer'),
    Configuration = require('./configuration'),
    Email         = require('../models/email'),
    EmailHistory  = require('../models/email_history'),
    Logging       = require('./logging');

module.exports = function(app) {

  let cached_templates = {},
      cache_time       = Configuration['mailer']['cache']['time'];

  Logging.info(`Email template caching time: ${cache_time}ms`);

  /*! Find an email template either from memory cache or database
   * \param name      - name of email template to find
   * \param language  - language of template to find
   * \param callaback - method to call when done
   */
  let findEmailTemplate = function(name, language, callback) {
    // First check if email template is in memory cache and usable
    const template_key    = `${name}-${language}`;
    const cached_template = cached_templates[template_key];
    if(cached_template && cached_template.loadedAt + cache_time > Date.now()) {
      Logging.info(`Email template '${template_key}' already in cache, using it.`);
      return callback(cached_template.template);
    }

    // Email template's not in memory cache, let's get it from database
    Logging.info(`Email template '${template_key}' not in cache, loading it.`);
    Email.findByName(name, language, function(email_template) {
      // Save just loaded email template in cache for future calls
      if(email_template)
        cached_templates[template_key] = {template: email_template, loadedAt: Date.now()};

      return callback(email_template);
    });
  };

  // Configure mailer
  mailer.extend(app, {
    from:             Configuration['mailer']['from'],
    host:             Configuration['mailer']['host'],
    secureConnection: Configuration['mailer']['secureConnection'],
    port:             Configuration['mailer']['port'],
    transportMethod:  Configuration['mailer']['transportMethod']
  });

  let Mailer = {

    send: function(template_name, language, options, data) {
      findEmailTemplate(template_name, language, function(email_template) {
        if(!email_template)
          throw 'No email template: ' + template_name;

        const subject = email_template.subject;

        // Replace placeholders in content
        let content = email_template.content;
        for(const key in data)
          content = content.replace('[' + key + ']', data[key]);

        app.mailer.send('email_layout', {
          to: options['receivers'],
          subject: subject,
          content: content
        }, function(error) {
          if(error)
            Logging.error(error);

          let email_history = new EmailHistory({
            name   : template_name,
            options: options,
            subject: subject,
            content: content,
            error  : error
          });
          email_history.save();
        });
      })
    }

  };

  return Mailer;
}
