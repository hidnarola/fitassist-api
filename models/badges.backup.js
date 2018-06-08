//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var TimeLimitSchema = new Schema({

    startDate:{type:Date,required:false},
    endDate:{type:Date,required:false},
    toDate:{type:Number,required:false},

}, {versionKey: false});

var TaskSchema = new Schema({
    
    taskId:{type: mongoose.Schema.Types.ObjectId, ref: "badge_task", required:true},
    value:{type:Number,required:true},
    unit:{type:String,enum:["kms", "kgs"],required:true},

}, {versionKey: false});


var BadgesSchema = new Schema({
    name: {type: String,required:true},
    descriptionCompleted: {type:String,default:null},
    descriptionInCompleted: {type:String,default:null},
    points: {type: Number,default:0, required:true},
    task : {type:TaskSchema,required:true},
    timeType:{type:String,enum:["standard","time_window","timed"],default:"standard",required:false},
    timeLimit:{type:TimeLimitSchema,required:true},
    category : [{type: mongoose.Schema.Types.ObjectId, ref: "badge_categories", default:null}],
    tags : [{type: String, default:null}],
    status:{type:Number,default:1},
    isDeleted:{type:Number,default:0},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var Badges = mongoose.model('badges', BadgesSchema, 'badges');

module.exports = Badges;