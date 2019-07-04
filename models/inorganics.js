//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var InorganicsSchema = new Schema({
    foodCode: {
        type: String
    },
    foodName: {
        type: String
    },
    description: {
        type: String
    },
    group: {
        type: String,
    },
    previous: {
        type: String
    },
    mainDataReference: {
        type: String
    },
    footNote: {
        type: String
    },
    sodium: {
        type: String
    },
    potassium: {
        type: String
    },
    calcium: {
        type: String
    },
    magnesium: {
        type: String
    },
    phosphorus : {
        type: String
    },
    iron : {
        type: String
    },
    copper : {
        type: String
    },
    zinc : {
        type: String
    },
    chloride : {
        type: String
    },
    manganese : {
        type: String
    },
    selenium : {
        type: String
    },
    iodine : {
        type: String
    }
}, {
        versionKey: false
    });

// Compile model from schema
var Inorganics = mongoose.model("inorganics", InorganicsSchema, "inorganics");

module.exports = Inorganics;