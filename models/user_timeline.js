//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserTimelineSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    createdBy: {
      type: String,
      ref: "users",
      field: "authUserId"
    },
    progressPhotoId: {
      type: String,
      ref: "user_progress_photos",
      default: null
    },
    postPhotoId: {
      type: String,
      ref: "user_posts",
      default: null
    },
    exercise: {
      type: String,
      default: null
    },
    workout: {
      type: String,
      default: null
    },
    goal: {
      type: String,
      default: null
    },
    tagLine: {
      type: String,
      default: null
    },
    status: { type: Number, default: 1 },
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserTimeline = mongoose.model(
  "user_timeline",
  UserTimelineSchema,
  "user_timeline"
);

module.exports = UserTimeline;
