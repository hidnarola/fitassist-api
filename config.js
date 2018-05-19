var log4js = require("log4js");
log4js.configure({
  appenders: { development: { type: "file", filename: "log_file.log" } },
  categories: { default: { appenders: ["development"], level: "trace" } }
});

module.exports = {
  //API url for search recipe
  RECIPE_API_URL:
    "https://api.edamam.com/search?app_id=b55ed2b8&app_key=791594812dac61912e88ba6af2dd73b7",

  // App config
  node_port: 3300,
  logger: log4js.getLogger("development"),

  //Auth0 config
  jwksUri: "https://fitassist.eu.auth0.com/.well-known/jwks.json",
  audience: "https://fitassist.eu.auth0.com/api/v2/",
  issuer: "https://fitassist.eu.auth0.com/",
  grant_type: "client_credentials",
  client_id: "lpiNJFwBeKI3PjUHmNV7Rp9SNQHbRZx0",
  client_secret:
    "ZALaNjSvLMtlR0ctmJ9wR6MShRDKQ9qrAT9klrsPzU5F4KhmGsLzEjrmoVD3B-p3",
  algorithms: "RS256",

  // Database config
  database: "mongodb://fitassist:jP3gnc4fW9@167.99.90.169/fitassist",

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
  INTERNAL_SERVER_ERROR: 500
};
