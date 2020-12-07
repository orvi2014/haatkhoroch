const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis);
const config = require('./config/config');
const logger = require('./config/winston');

const client = redis.createClient({
  port: config.redis.port,
  host: config.redis.host,
  // detect_buffers: true
});

client.auth(config.redis.password, (err, response) => {
  if (err) {
    logger.error(`${err}`);
  }
  logger.info(`authentication: ${response}`);
});
client.on('connect', () => {
  logger.info('REDIS ready');
});
client.on('error', (err) => {
  client.quit();
  logger.error('REDIS ' + err.message);
});
client.on('end',  () => {
  logger.info('REDIS disconnect');
  
});
// client.quit();                           
module.exports = client;
