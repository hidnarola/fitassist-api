//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserSettingSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "users",
      field: "authUserId",
      required: true,
      unique: true
    },
    bodyMeasurement: {
      type: String,
      enum: ["cm", "inch"],
      default: "cm"
    },
    weight: {
      type: String,
      enum: ["kg", "lb"],
      default: "kg"
    },
    distance: {
      type: String,
      enum: ["km", "mile"],
      default: "km"
    },
    postAccessibility: {
      type: Number,
      default: 3
    },
    commentAccessibility: {
      type: Number,
      default: 3
    },
    messageAccessibility: {
      type: Number,
      default: 3
    },
    friendRequestAccessibility: {
      type: Number,
      default: 3
    },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserSetting = mongoose.model(
  "user_settings",
  UserSettingSchema,
  "user_settings"
);

module.exports = UserSetting;
