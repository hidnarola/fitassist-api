//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var BodyPartSchema = new Schema({
    bodypart: {
        type: String,
        required: true
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
}, {
    versionKey: false
});

// Compile model from schema
var BodyPart = mongoose.model('bodyparts', BodyPartSchema, 'bodyparts');

module.exports = BodyPart;