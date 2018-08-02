const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
var config = require("../config");

const auth = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: config.JWKS_URI
  }),

  // Validate the audience and the issuer.
  audience: config.AUDIENCE,
  issuer: config.ISSUER,
  algorithms: [config.ALGORITHMS]
});

module.exports = auth;
