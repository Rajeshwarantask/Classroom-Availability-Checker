const mongoose = require("mongoose");

const ProjectorSchema = new mongoose.Schema({
  room: { type: String, required: true, unique: true }, // Room number
  projector: { type: Boolean, required: true } // Whether it has a projector
});

module.exports = mongoose.model("Projector", ProjectorSchema, "projector");
