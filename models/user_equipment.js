//import { Mongoose } from 'mongoose';

//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserEquipmentSchema = new Schema({
    userId: {type: String, ref: "users", field:"authUserId", required: true},
    equipmentsId : [{type: mongoose.Schema.Types.ObjectId, ref: "equipments", required: true}],
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
}, { versionKey: false });

// Compile model from schema
var UserEquipment = mongoose.model('userequipments', UserEquipmentSchema, 'userequipments');

module.exports = UserEquipment;