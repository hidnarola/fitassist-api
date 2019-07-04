//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var organic_acidsSchema = new Schema({
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
    citric_acid: {
        type: String
    },
    malic_acid: {
        type: String
    }
},
    {
        versionKey: false
    });

// Compile model from schema
var organic_acids = mongoose.model("organic_acids", organic_acidsSchema, "organic_acids");

module.exports = organic_acids;