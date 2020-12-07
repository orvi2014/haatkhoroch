const winston = require('winston');

const logger = new winston.createLogger({
  levels: winston.config.npm.levels,
  defaultMeta: { service: 'user-service' },
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.metadata(),
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.prettyPrint(),
    winston.format.printf((log) => {
      return `${log.level}: ${process.pid} ${log.message} ${log.timestamp} `;
    }),
  ),
  transports: [
    new winston.transports.Console({ colorize: true }),
    new winston.transports.File({
      colorize: true,
      json: false,
      filename: 'tigrow.log',
    }),
    new winston.transports.File({
      colorize: true,
      json: false,
      filename: 'tigrow.error.log',
      level: 'error',
    }),
    new winston.transports.File({
      colorize: true,
      json: false,
      filename: 'tigrow.info.log',
      level: 'info',
    }),
  ],
});

module.exports = logger;
