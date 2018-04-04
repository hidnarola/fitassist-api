//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    firstName: {type: String, required:true},
    lastName: {type: String, required:true},
    email: {type: String, required:true, unique : true},
    mobileNumber: {type: Number, required:false},
    username: {type: String, required:true, unique : true},
    password: {type: String, required:true},
    gender: {type: String, enum: ['male','female','transgender'], default:'male'},
    dateOfBirth: {type: Date, default:null},
    goal: [{type: String, enum:['Gain Muscle','Gain Flexibility','Lose Fat','Gain Strength','Gain Power','Increase Endurance']}],
    avatar: {type: String},
    aboutMe: {type: String},
    favRecipes: [mongoose.Schema.Types.ObjectId],
    status: {type:Number, default:1},
    isDelete: {type:Boolean, default:0},
    refreshToken: {type: String},
    lastLoginDate: {type: Date},
    passwordChangedDate: {type: Date},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

UserSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

// Compile model from schema
var User = mongoose.model('users', UserSchema, 'users');

module.exports = User;