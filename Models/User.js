const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    isSeller: { type: Boolean, default: false },
    isCustomer: { type: Boolean, default: false },
    isDelivery: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("user", userSchema);
