'use strict'

let path = require('path');
process.env['MYPROJECT_CONFIG_DIR']        = path.join(__dirname, '../conf/frontend/');
process.env['MYPROJECT_COMMON_CONFIG_DIR'] = path.join(__dirname, '../conf/');

let express        = require('express'),
    app            = express(),
    expressLayouts = require('express-ejs-layouts'),
    i18n           = require('i18n'),
    fs             = require('fs'),
    passport       = require('passport'),
    bodyParser     = require('body-parser'),
    cookieParser   = require('cookie-parser'),
    session        = require('express-session'),
    redisStore     = require('connect-redis')(session),
    redis          = require('redis'),
    mongoose       = require('mongoose'),
    Logging        = require('../utils/logging'),
    Configuration  = require('../utils/configuration'),
    Routes         = require('./routes/routes');

// Read SSL conf
let https = require('https').createServer({
  key: fs.readFileSync(Configuration['server']['key'], 'utf8'),
  cert: fs.readFileSync(Configuration['server']['cert'], 'utf8')}, app);

// Extends objects properties
require('../utils/extends');

// Add mailer to app
app.Mailer = require('../utils/mailer')(app);

// Connection to mongodb
mongoose.connect(`mongodb://${Configuration['mongo']['address']}/${Configuration['mongo']['database']}`);
mongoose.connection.on('error', function(error) { throw error; });

// Passport configuration
require('./utils/passport')(passport, app);

// i18n configuration
const locales = ['en', 'fr'];
i18n.configure({
  locales: locales,
  cookie: 'language',
  directory: path.join(__dirname, './translations'),
  updateFiles: false,
});

// Set up ejs for templating
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser(Configuration['cookies']['secret']));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: Configuration['session']['secret'],
  resave: false,
  saveUninitialized: false,
  store: new redisStore({
                          client: redis.createClient(),
                          host: Configuration['redis']['host'],
                          port: Configuration['redis']['port'],
                          ttl: Configuration['redis']['ttl'],
                          db: Configuration['redis']['db_number']
                        })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('connect-flash')());
app.use(i18n.init);

// Middleware to set some values
app.use(function(req, res, next) {
  // Register some values to request
  req.previous_url = req.header('Referer') || Routes.home.route;

  // Those values go to views
  res.locals.user      = req.user;
  res.locals.messages  = require('express-messages')(req, res);
  res.locals.routes    = Routes;
  res.locals.routing   = require('./utils/routing');
  res.locals.languages = locales;
  res.locals.language  = req.locale;

  next();
});

app.use(expressLayouts);

// Routing
require('./routes/home.js')(app);
require('./routes/login.js')(app, passport);
require('./routes/logout.js')(app);
require('./routes/register.js')(app);

// Catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  res.status(404).render('404.ejs');
});

// Error handler
app.use(function(error, req, res, next) {
  Logging.error(error);
  res.status(500).render('500.ejs');
});

// Start application
const port = Configuration['server']['port'];
let server = https.listen(port, function () {
  Logging.info(`Listening on port ${port}`);
});

// Disable 'x-powered-by' http header
app.disable('x-powered-by');

// Listen for TERM (kill) and INT (Ctrl-C) signals for graceful shutdown
let force_shut_down = false;
let gracefulShutdown = function(signal) {
  if(force_shut_down) {
    Logging.info('Signal to kill server already received, forcing kill.');
    process.exit();
  }

  Logging.info(`Received signal to shutdown (${signal})`);
  force_shut_down = true;

  Logging.info('Server shutting down...');
  server.close(function() {
    Logging.info('Server shutted down!');
    process.exit();
  });
};
process.on('SIGTERM', function() { gracefulShutdown('SIGTERM'); });
process.on('SIGINT', function() { gracefulShutdown('SIGINT'); });
