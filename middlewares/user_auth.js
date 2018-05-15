const jwt = require("express-jwt");
const jwtAuthz = require("express-jwt-authz");
const jwksRsa = require("jwks-rsa");
var config = require('../config');

const auth = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: config.jwksUri
  }),

  // Validate the audience and the issuer.
  audience: config.audience,
  issuer: config.issuer,
  algorithms: [config.algorithms]
});

module.exports= auth;