const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  userId: {
    type: ObjectId,
    required: true,
    ref: "Customer",
  },
  items: [
    {
      productId: { type: ObjectId, required: true },
      productName: { type: String, required: true },
      categoryName: { type: String, required: true },
      image: { type: String },
      quantity: { type: Number, required: true },
      itemStatus: {
        type: String,
        required: true,
        default: "Ordered",
      },
      reason: {
        type: String,
      },
      price: { type: Number, required: true },
      offerDiscount: { type: Number },
      reason: { type: String },
      isApproved: { type: Boolean, default: 0 },
    },
  ],
  address: {
    name: { type: String },
    mobile: { type: String },
    pincode: { type: String },
    house: { type: String },
    locality: { type: String },
    city: { type: String },
    state: { type: String },
  },
  paymentMethod: { type: String, required: true },
  status: { type: String, required: true, default: "Ordered" },
  paymentStatus: { type: String, required: true, default: "Pending" },
  date: { type: Date, default: () => Date.now(), required: true },
  orderPrice: { type: Number },
  discount: { type: Number },
});

module.exports = mongoose.model("Order", orderSchema);
