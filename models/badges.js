//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var BadgesSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    role: { type: String, required: true },
    name: {
      type: String,
      required: true
    },
    descriptionCompleted: {
      type: String,
      default: "Congratulations you have earned badge"
    },
    descriptionInCompleted: {
      type: String,
      default: ""
    },
    unit: {
      type: String,
      enum: constant.BADGES_UNIT,
      default: 0,
      required: true
    },
    baseUnit: {
      type: String
    },
    baseValue: {
      type: Number,
      default: 0,
      required: true
    },
    value: {
      type: Number,
      default: 0,
      required: true
    },
    task: {
      type: String,
      enum: _.union(
        constant.BADGES_TYPE.PROFILE,
        constant.BADGES_TYPE.PROFILE,
        constant.BADGES_TYPE.BODY_MASS,
        constant.BADGES_TYPE.BODY_FAT,
        constant.BADGES_TYPE.BODY_MEASUREMENT,
        constant.BADGES_TYPE.WEIGHT_LIFTED,
        constant.BADGES_TYPE.WORKOUTS,
        constant.BADGES_TYPE.RUNNING,
        constant.BADGES_TYPE.HEART_RATE,
        constant.BADGES_TYPE.CYCLE,
        constant.BADGES_TYPE.STEPS,
        constant.BADGES_TYPE.CALORIES,
        constant.BADGES_TYPE.NUTRITIONS
      ),
      required: true
    },
    timeType: {
      type: String,
      enum: ["standard", "time_window"],
      default: "standard"
    },
    baseDuration: {
      type: Number
    },
    category: {
      type: String
    },
    timeWindowType: {
      type: String,
      enum: ["day", "week", "month", "year"]
    },
    duration: {
      type: Object,
      default: null
    },
    point: {
      type: Number,
      required: true,
      default: 0
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
  },
  {
    versionKey: false
  }
);

// Compile model from schema
var Badges = mongoose.model("badges", BadgesSchema, "badges");

module.exports = Badges;
