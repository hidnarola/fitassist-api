//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var mufaFoodSchema = new Schema({
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
    c10_Food: {
        type: String
    },
    cis_c10_Food: {
        type: String
    },
    c12_Food: {
        type: String
    },
    cis_c12_Food: {
        type: String
    },
    c14_Food: {
        type: String
    },
    cis_c14_Food: {
        type: String
    },
    c15_Food: {
        type: String
    },
    cis_c15_Food: {
        type: String
    },
    c16_Food: {
        type: String
    },
    cis_c16_Food: {
        type: String
    },
    c17_Food: {
        type: String
    },
    cis_c17_Food: {
        type: String
    },
    c18_Food: {
        type: String
    },
    cis_c18_Food: {
        type: String
    },
    cis_trans_C18_1n_9_Food: {
        type: String
    },
    cis_trans_c18_1n_7_Food: {
        type: String
    },
    c20_Food: {
        type: String
    },
    cis_c20_Food: {
        type: String
    },
    c22_Food: {
        type: String
    },
    cis_c22_Food: {
        type: String
    },
    cis_trans_c22_1n_11_Food: {
        type: String
    },
    cis_trans_c22_1n_9_Food: {
        type: String
    },
    c24_Food: {
        type: String
    },
    cis_c24_Food: {
        type: String
    },
    trans_monounsaturated_Food: {
        type: String
    }
},
    {
        versionKey: false
    });

// Compile model from schema
var mufaFood = mongoose.model("mufaFood", mufaFoodSchema, "mufaFood");

module.exports = mufaFood;