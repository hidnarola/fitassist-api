var config = require("../config");
var jwtDecode = require("jwt-decode");
var user_helper = require("../helpers/user_helper")


module.exports = async function (req, res, next) {
  try {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    if (authUserId) {
      var userData = await user_helper.get_user_by_id(authUserId);
      if (userData && typeof userData.status !== "undefined" && userData.user.status === 1) {
        next();
      }
      else {
        return res.status(config.UNAUTHORIZED).json({
          status: 0,
          message: "You are blocked"
        });
      }

    } else {
      return res.status(config.UNAUTHORIZED).json({
        message: 'Unauthorized access'
      });
    }
  } catch (error) {
    console.log('error middleware => ',error);
    return res.status(config.UNAUTHORIZED).json({
      message: 'Invalid token'
    });
  }
}



// module.exports = auth;
