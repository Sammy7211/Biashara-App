import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  fullAddress: { type: String, required: true },

  cart: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number
    }
  ],

  totalPrice: { type: Number, required: true },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Order", orderSchema);
