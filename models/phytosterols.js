//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var phytosterolsSchema = new Schema({
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



    total_phytosterols:{
        type: String
    },
    other_cholesterol_and_phytosterols:{
        type: String
    },
    phytosterol: {
        type: String
    },
    beta_sitosterol: {
        type: String
    },
    brassicasterol: {
        type: String
    },
    campesterol: {
        type: String
    },
    delta_5_avenasterol: {
        type: String
    },
    delta_7_avenasterol: {
        type: String
    },
    delta_7_stigmastenol: {
        type: String
    },
    stigmasterol: {
        type: String
    }   
},
    {
        versionKey: false
    });

// Compile model from schema
var phytosterols = mongoose.model("phytosterols", phytosterolsSchema, "phytosterols");

module.exports = phytosterols;