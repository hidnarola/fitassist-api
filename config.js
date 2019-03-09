var log4js = require("log4js");
log4js.configure({
  appenders: {
    development: {
      type: "file",
      filename: "log_file.log"
    }
  },
  categories: {
    default: {
      appenders: ["development"],
      level: "trace"
    }
  }
});
const dotenv = require("dotenv").config();

module.exports = {
  BASE_URL: process.env.BASE_URL,

  //API url for search recipe
  RECIPE_API_URL: "https://api.edamam.com/search?app_id=b55ed2b8&app_key=791594812dac61912e88ba6af2dd73b7",

  // App config
  node_port: process.env.NODE_PORT,
  logger: log4js.getLogger("development"),

  //Auth token generation body data
  CLIENT_ID: "lpiNJFwBeKI3PjUHmNV7Rp9SNQHbRZx0",
  AUTH_TOKEN_URL: "https://fitassist.eu.auth0.com/oauth/token",
  AUTH_USER_API_URL: "https://fitassist.eu.auth0.com/api/v2/users/",

  //Auth0 config
  JWKS_URI: "https://fitassist.eu.auth0.com/.well-known/jwks.json",
  AUDIENCE: "https://fitassist.eu.auth0.com/api/v2/",
  ISSUER: "https://fitassist.eu.auth0.com/",
  GRANT_TYPE: "client_credentials",
  CLIENT_SECRET: "ZALaNjSvLMtlR0ctmJ9wR6MShRDKQ9qrAT9klrsPzU5F4KhmGsLzEjrmoVD3B-p3",
  ALGORITHMS: "RS256",

  AUTH_TOKEN_GENRATION_CREDENTIALS: {
    grant_type: "client_credentials",
    client_id: this.CLIENT_ID,
    client_secret: "ZALaNjSvLMtlR0ctmJ9wR6MShRDKQ9qrAT9klrsPzU5F4KhmGsLzEjrmoVD3B-p3",
    audience: "https://fitassist.eu.auth0.com/api/v2/"
  },

  // Database config
  DATABASE: "mongodb://fitassist:jP3gnc4fW9@167.99.90.169/fitassist",

  // JWT
  ACCESS_TOKEN_SECRET_KEY: "fitassist_jwt_token",
  REFRESH_TOKEN_SECRET_KEY: "fitassist_jwt_refresh_token",
  ACCESS_TOKEN_EXPIRE_TIME: 60 * 60 * 24 * 7, // 7 days
  // "ACCESS_TOKEN_EXPIRE_TIME" : 60 * 60 * 24 * 100, // 100 days

  // HTTP Status
  OK_STATUS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  MEDIA_ERROR_STATUS: 415,
  VALIDATION_FAILURE_STATUS: 417,
  DATABASE_ERROR_STATUS: 422,
  INTERNAL_SERVER_ERROR: 500,
  
  // SSL
  IS_HTTPS:process.env.IS_HTTPS,
  SSL_CERT:process.env.SSL_CERT,
  SSL_KEY:process.env.SSL_KEY
};