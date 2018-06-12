//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var BadgesAssignSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    badgeName: { type: String, require: true },
    type: { type: String },
    descriptionCompleted: { type: String, require: true },
    meta: { type: Object },
    point: { type: Number, require: true },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var BadgesAssign = mongoose.model(
  "badges_assign",
  BadgesAssignSchema,
  "badges_assign"
);

module.exports = BadgesAssign;