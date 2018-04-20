//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;


var BadgesSchema = new Schema({
    name: {type: String,required:true},
    desciptionCompleted: {type:String,default:null},
    desciptionInCompleted: {type:String,default:null},
    points: {type: Number,default:0},
    task : taskSchema,
    timeLimit:{},
    existingInjuries : [{type: mongoose.Schema.Types.ObjectId, ref: "bodyparts", default:null}],
    workoutscheduletype : {type: Number,default:1, required:true},
    timeSchedule : TimeSchema,
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var Badges = mongoose.model('badges', BadgesSchema, 'badges');

module.exports = Badges;