//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var TimeLimitSchema = new Schema(
  {
    toDate: { type: Date, required: false },
    fromDate: { type: Date, required: false },
    all: { type: Number, required: false, default: 0 }
  },
  { versionKey: false }
);
var BadgesSchema = new Schema(
  {
    name: { type: String, required: true },
    descriptionCompleted: {
      type: String,
      default: "congratulations you have earned badge"
    },
    descriptionInCompleted: { type: String, default: "" },
    unit: {
      type: String,
      enum: [
        "n/a",
        "cm",
        "feet",
        "kg",
        "lb",
        "percentage",
        "in",
        "number",
        "minute",
        "meter",
        "mile",
        "bpm",
        "g",
        "mg"
      ],
      default: 0,
      required: true
    },
    baseUnit: { type: String },
    baseValue: { type: Number, default: 0, required: true },
    value: { type: Number, default: 0, required: true },
    task: {
      type: String,
      enum: [
        "update",
        "gain",
        "loss",
        "average",
        "most",
        "least",
        "total_gain",
        "total_loss"
      ],
      required: true
    },
    duration: { type: TimeLimitSchema, required: true },
    point: { type: Number, default: 10 },
    status: { type: Number, default: 1 },
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var Badges = mongoose.model("badges", BadgesSchema, "badges");

module.exports = Badges;
