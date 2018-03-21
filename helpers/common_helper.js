var bcrypt = require('bcrypt');
var common_helper = {};

common_helper.hash_password = async () => {
    return bcrypt.compare(this.password, this.hash, function (err, res) {
        if (err) {
            return {"status":0,"error":err};
        } else {
            return {"status":1,"res":res};
        }
    });
};

module.exports = common_helper;