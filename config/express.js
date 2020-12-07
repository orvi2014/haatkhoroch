const config = require('./config');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const passport = require('passport');
const methodOverride = require('method-override');
const cors = require('cors');
const httpStatus = require('http-status');
const expressWinston = require('express-winston');
const expressValidation = require('express-validation');
const helmet = require('helmet');
const winstonInstance = require('./winston');

const routes = require('../index.route');
const { APIError } = require('../server/helpers/APIError');
const {
  sendErrorResponse,
} = require('../server/helpers/jsonResponse');

const mongoErrorHandler = require('../server/helpers/mongoErrorFormat');
const app = express();

if (config.env === 'development' || config.env === 'production') {
  app.use(logger('dev') || logger('prod'));
}

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.use(helmet.noSniff());

app.use(cors());

// TODO: cors customize
// enable detailed API logging in dev env
if (
  config.env === 'development' ||
  config.env === 'test' ||
  config.env === 'local'
) {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(
    expressWinston.logger({
      winstonInstance,
      meta: true,
      msg:
        'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
      colorStatus: true,
    }),
  );
}

app.get('/', (req, res) => {
  res.send({
    version: '2.3.0',
    android_app_link:
      'https://play.google.com/store/apps/details?id=co.tigrow.tigrow_app',
  });
});
// mount all routes on /api path

app.use('/api/v1', routes); // v1.0
app.use(mongoErrorHandler);
// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors
      .map((error) => error.messages.join('. '))
      .join(' and ');
    const error = new APIError(unifiedErrorMessage, err.status, true);
    return next(error);
  } else if (!(err instanceof APIError)) {
    logger.error(`${err.message}`);
    const apiError = new APIError(
      err.message,
      err.status,
      err.isPublic,
    );
    return next(apiError);
  }
  return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  return sendErrorResponse(res, 404, 'MethodNotFoundError', {
    message: 'API not found',
  });
});

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
  app.use(
    expressWinston.errorLogger({
      winstonInstance,
    }),
  );
}

// // error handler, send stacktrace only during development
app.use((err, req, res, next) => {
  const stack =
    config.env === 'development' ? err.stack.split('\n') : {};
  let frame = err.stack;
  let lineNumber = frame.split(':')[1];
  const response = {
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack,
    lineNumber,
    frame,
  };
  winstonInstance.info(`${response}`);
  res.status(err.status).json({
    message: err.isPublic ? err.message : httpStatus[err.status],
  });
});

module.exports = app;
