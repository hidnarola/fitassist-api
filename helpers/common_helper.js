var bcrypt = require('bcrypt');
var common_helper = {};

common_helper.hashPassword = function (callback) {
    console.log("in hash password");
    bcrypt.compare(this.password, this.hash, function (err, res) {
        if (err) {
            callback({"status":0,"error":err});
        } else {
            callback({"status":1,"res":res});
        }
    });
};

common_helper.changeObject = function (data,callback) {
    console.log(data);
};

module.exports = common_helper;