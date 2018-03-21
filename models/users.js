//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName: {type: String, required:true},
    lastName: {type: String, required:true},
    email: {type: String, required:true, unique : true},
    username: {type: String, required:true, unique : true},
    password: {type: String, required:true},
    gender: {type: String, enum: ['male','female','transgender'], default:'male'},
    date_of_birth: {type: Date},
    avatar: {type: String},
    aboutMe: {type: String},
    favRecipes: [mongoose.Schema.Types.ObjectId],
    status: {type:Boolean, default:true},
    refreshToken: {type: String},
    lastLoginDate: {type: Date},
    passwordChangedDate: {type: Date},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var User = mongoose.model('users', UserSchema, 'users');

module.exports = User;
