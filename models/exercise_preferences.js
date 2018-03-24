//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var ExercisePreferenceSchema = new Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
    workoutIntensity: {type: Number},
    experienceLevel: {type: Number},
    workoutLocation: {type: String},
    excludeExercise : [{type: mongoose.Schema.Types.ObjectId}],
    excludeExerciseType : [{type: mongoose.Schema.Types.ObjectId}],
    exerciseInjuries : [{type: mongoose.Schema.Types.ObjectId}],
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var Exercise_preference = mongoose.model('exercise_preference', ExercisePreferenceSchema, 'exercise_preference');

module.exports = Exercise_preference;