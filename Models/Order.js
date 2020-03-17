const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Order = new Schema(
  {
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    amountPaid: { type: String },
    customerName: { type: String, required: true },
    customerAddress: { type: String, required: true },
    cardHolderName: { type: String, required: true },
    cardNumber: { type: String, required: true },
    expMonth: { type: String, required: true },
    expYear: { type: String, required: true },
    cardCVV: { type: String, required: true },
    isAccepted: { type: Boolean, default: false },
    isDeclined: { type: Boolean, default: false },
    outForDelivery: { type: Boolean, default: false },
    isdelivered: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("order", Order);
