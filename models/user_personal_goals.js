//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

// var UserPersonalGoalsSchema = new Schema(
//   {
//     userId: { type: String, ref: "users", field: "authUserId", required: true },
//     start: {
//       type: Number,
//       default: 0,
//       required: true
//     },
//     target: {
//       type: Number,
//       default: 0,
//       required: true
//     },
//     unit: {
//       type: String,
//       required: true
//     },
//     task: {
//       type: String,
//       enum: [
//         "weight_gain",
//         "weight_loss",
//         "body_fat_gain",
//         "body_fat_loss",
//         "body_fat_average",
//         "body_fat_most",
//         "body_fat_least",
//         "neck_measurement_gain",
//         "neck_measurement_loss",
//         "shoulders_measurement_gain",
//         "shoulders_measurement_loss",
//         "chest_measurement_gain",
//         "chest_measurement_loss",
//         "upper_arm_measurement_gain",
//         "upper_arm_measurement_loss",
//         "waist_measurement_gain",
//         "waist_measurement_loss",
//         "forearm_measurement_gain",
//         "forearm_measurement_loss",
//         "hips_measurement_gain",
//         "hips_measurement_loss",
//         "thigh_measurement_gain",
//         "thigh_measurement_loss",
//         "calf_measurement_gain",
//         "calf_measurement_loss",
//         "weight_lifted_total",
//         "weight_lifted_average",
//         "weight_lifted_most",
//         "weight_lifted_least",
//         "workouts_total",
//         "workouts_average",
//         "running_distance_total",
//         "running_distance_average",
//         "running_distance_most",
//         "running_distance_least",
//         "running_time_average",
//         "running_time_total",
//         "running_elevation_total",
//         "running_elevation_average",
//         "cycle_distance_total",
//         "cycle_distance_average",
//         "cycle_distance_most",
//         "cycle_distance_least",
//         "cycle_time_total",
//         "cycle_time_average",
//         "cycle_elevation_total",
//         "cycle_elevation_average",
//         "steps_total",
//         "steps_average",
//         "steps_most",
//         "steps_least",
//       ],
//       required: true
//     },
//     isCompleted: {
//       type: Number,
//       default: 0
//     },
//     createdAt: { type: Date, default: Date.now },
//     modifiedAt: { type: Date, default: Date.now }
//   },
//   { versionKey: false }
// );

var UserPersonalGoalsSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    title: { type: String, required: true },
    start: {
      type: Number,
      default: 0,
      required: true
    },
    target: {
      type: Number,
      default: 0,
      required: true
    },
    unit: {
      type: String,
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
    timeScale: { type: Number, default: 1, required: true },
    timeUnit: {
      type: String,
      enum: ["day", "week", "month", "year"],
      required: true
    },
    description: { type: String },
    visibility: {
      type: String,
      enum: ["public", "private", "friends"],
      default: "private"
    },
    category: { type: String },
    isCompleted: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Number,
      default: 0
    },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserPersonalGoals = mongoose.model(
  "user_personal_goals",
  UserPersonalGoalsSchema,
  "user_personal_goals"
);

module.exports = UserPersonalGoals;
