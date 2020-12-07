const mongoose = require('mongoose');
const util = require('util');
const debug = require('debug')('express-mongoose-es6-rest-api:index');

Promise = require('bluebird');
const loggerDispatcher = 'Index';
// config should be imported before importing any other file
const config = require('./config/config');
const client = require('./index.redis');
const app = require('./config/express');
const logger = require('./config/winston');

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
const mongoUri = config.mongo.host;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.connect(mongoUri, () => {});
logger.info('MongoDB is connected');
mongoose.connection.on('error', () => {
  // webhook('unable to connect database');
  logger.error(`unable to connect to database: ${mongoUri}`);
});

// print mongoose logs in dev env
if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(
      `${collectionName}.${method}`,
      util.inspect(query, false, 20),
      doc,
    );
  });
}

if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    logger.info(
      `Ok, server is running on port ${config.port} (${config.env})`,
    );
  });
}

process.on('unhandledRejection', async (err, promise) => {
  logger.error(err, {
    dispatcher: loggerDispatcher,
    from: 'unhandledRejection event',
    promise,
  });
});

process.on('uncaughtException', (err) => {
  logger.error(
    err,
    { dispatcher: loggerDispatcher, from: 'uncaughtException event' },
    () => {
      process.exit(1);
    },
  );
});
process.on('exit', async (code) => {
  mongoose.connection.close();
  client.quit();
  logger.info(`About to exit with code: ${code}`);
});
process.on('SIGINT', function () {
  logger.info('Caught interrupt signal');
  process.exit();
});
module.exports = app;
