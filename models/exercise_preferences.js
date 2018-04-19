//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var TimeSchema = new Schema(
    {
            monday:{type:String,default:"0"},
            tuesday:{type:String,default:"0"},
            wednesday:{type:String,default:"0"},
            thursday:{type:String,default:"0"},
            friday:{type:String,default:"0"},
            saturday:{type:String,default:"0"},
            sunday:{type:String,default:"0"},   
    });


var ExercisePreferenceSchema = new Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
    workoutIntensity: {type: Number,default:0},
    exerciseExperience : {type: Number,default:0},
    excludeExercise : [{type: mongoose.Schema.Types.ObjectId, ref: "exercise", default:null}],
    excludeExerciseType : [{type: mongoose.Schema.Types.ObjectId, ref: "exercise_types", default:null}],
    existingInjuries : [{type: mongoose.Schema.Types.ObjectId, ref: "bodyparts", default:null}],
    workoutscheduletype : {type: Number,default:1, required:true},
    timeSchedule : TimeSchema,
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var Exercise_preference = mongoose.model('exercise_preference', ExercisePreferenceSchema, 'exercise_preference');

module.exports = Exercise_preference;