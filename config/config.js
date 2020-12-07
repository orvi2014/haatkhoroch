const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    // .allow(['dev', 'production', 'test', 'integration'])
    .default('dev'),
  PORT: Joi.number()
    .default(4044),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('dev'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign'),
  MONGO_HOST: Joi.string().required()
    .description('Mongo DB host url'),
  MONGO_PORT: Joi.number()
    .default(27017),
  BUCKET_NAME: Joi.string()
    .required()
    .description('Bucket Name required'),
  AWS_ACCESS_KEY: Joi.string()
    .required()
    .description('AWS credential required'),
  AWS_SECRET_ACCESS_KEY: Joi.string()
    .required()
    .description('AWS secret key required'),
  S3_REGION: Joi.string()
    .required()
    .description('SES region required'),
  REDIS_HOST: Joi.string()
    .required()
    .description('Redis DB host url'),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_PORT: Joi.number(),

}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: envVars.JWT_SECRET,
  mongo: {
    host: envVars.MONGO_HOST,
    port: envVars.MONGO_PORT
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },
  awsAccessKey: envVars.AWS_ACCESS_KEY,
  awsSecretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  s3Region: envVars.S3_REGION,
  bucketName: envVars.BUCKET_NAME,
};

module.exports = config;
