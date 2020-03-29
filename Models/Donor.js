const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const donorSchema = new Schema({
	c_name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	amount: {
		type: Number,
		required: true
	},
	reference: {
		type: String
	}
});

const Donor = mongoose.model("donor", donorSchema);
module.exports = Donor;
