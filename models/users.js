//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  authUserId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  mobileNumber: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    enum: ["male", "female", "transgender"],
    default: "male"
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  height: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0
  },
  goal: {
    type: Object,
    default: null
  },
  workoutLocation: {
    type: String,
    enum: ["gym", "home"],
    default: "gym"
  },
  avatar: {
    type: String,
    default: null
  },
  aboutMe: {
    type: String,
    default: null
  },
  status: {
    type: Number,
    default: 1
  },
  isDeleted: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  modifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

// Compile model from schema
var User = mongoose.model("users", UserSchema, "users");

module.exports = User;