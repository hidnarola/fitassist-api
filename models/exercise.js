//import { Mongoose } from 'mongoose';

//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var ExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: false
    },
    mainMuscleGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bodyparts",
      required: true
    },
    otherMuscleGroup: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bodyparts",
        required: true
      }
    ],
    detailedMuscleGroup: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bodyparts",
        required: true
      }
    ],
    category: {
      type: String,
      required: true
    },
    subCategory: {
      type: String,
      default: ""
    },
    mechanics: {
      type: String,
      enum: ["compound", "isolation"],
      required: false,
      default: "compound"
    },
    equipments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        default: [],
        required: true
      }
    ],
    difficltyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      required: true,
      default: "beginner"
    },
    steps: {
      type: Array,
      required: false,
      default: []
    },
    tips: {
      type: Array,
      required: false,
      default: []
    },
    images: {
      type: Array,
      required: false,
      default: []
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
var Exercise = mongoose.model("exercise", ExerciseSchema, "exercise");

module.exports = Exercise;
