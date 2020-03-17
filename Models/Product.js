const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Product = new Schema(
  {
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    productDescription: { type: String, required: true },
    productPrice: { type: String, required: true },
    productQty: { type: String, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("product", Product);
