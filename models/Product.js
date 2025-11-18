import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: null // store filename (e.g., "phone.jpg")
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true // enforce that every product belongs to a seller
  }
}, { timestamps: true }); // adds createdAt & updatedAt automatically

export default mongoose.model("Product", productSchema);
