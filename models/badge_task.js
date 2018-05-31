//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var BadgeTaskSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true, default: null },
    unit: { type: String, enum: ["kms", "kgs"], required: true },
    status: { type: Number, default: 1 },
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var BadgeTask = mongoose.model("badge_task", BadgeTaskSchema, "badge_task");

module.exports = BadgeTask;
