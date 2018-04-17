//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema(
  {
    authUserId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "transgender"],
      default: "male"
    },
    dateOfBirth: { type: Date, default: null },
    height: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    goals: [
      {
        type: String,
        enum: [
          "gain_muscle",
          "gain_flexibility",
          "lose_fat",
          "gain_strength",
          "gain_power",
          "increase_endurance"
        ]
      }
    ],
    workoutLocation: {
      type: String,
      enum: ["gym", "home"],
      default: "gym"
    },
    avatar: { type: String },
    aboutMe: { type: String },
    status: { type: Number, default: 1 },
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);


// Compile model from schema
var User = mongoose.model("users", UserSchema, "users");

module.exports = User;
