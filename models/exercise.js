//import { Mongoose } from 'mongoose';

//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var ExerciseSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    mainMuscleGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bodyparts",
      required: true
    },
    otherMuscleGroup: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "bodyparts",
      required: true
    }],
    detailedMuscleGroup: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "bodyparts",
      required: true
    }],
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exercise_types",
      default: null,
      required: true
    },
    mechanics: {
      type: String,
      enum: ["compound", "isolation"],
      required: false
    },
    equipments: { type: Array, default: [], required: true },
    difficltyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      required: true
    },
    steps: { type: Array, required: false, default: [] },
    tips: { type: Array, required: false, default: [] },
    images: { type: Array, required: false, default: [] },
    measures: {
      type: String,
      enum: ["beginner", "intermediate", "expert",""],
      required: false
    },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var Exercise = mongoose.model("exercise", ExerciseSchema, "exercise");

module.exports = Exercise;
