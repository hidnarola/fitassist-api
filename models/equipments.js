//import { Mongoose } from 'mongoose';

//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var EquipmentSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    image: { type: String },
    status: { type: Boolean, default: true },
    category_id : {type: mongoose.Schema.Types.ObjectId, ref: "equipment_category", required: true},
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
}, { versionKey: false });

// Compile model from schema
var Equipment = mongoose.model('equipments', EquipmentSchema, 'equipments');

module.exports = Equipment;