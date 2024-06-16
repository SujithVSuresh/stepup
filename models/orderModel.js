const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: String,
    default: function () {
      return "OID" + 100000 + Math.floor(Math.random() * 900000) + "SS";
    },
    unique: true,
  },
  orderedItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      modelName: {
        type: String,
        required: true,
      },
      brand: {
        type: String,
        required: true,
      },
      gender: {
        type: String,
        required: true,
      },
      outerMaterial: {
        type: String,
        required: true,
      },
      soleMaterial: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      paymentStatus: {
        type: String,
        default: "Pending",
      },
      orderStatus: {
        type: String,
        default: "Pending",
      },
      orderedDate: {
        type: Date,
        default: Date.now,
      },
      shippedDate: {
        type: Date,
        required: false,
      },
      deliveredDate: {
        type: Date,
        required: false,
      },
      cancelledDate: {
        type: Date,
        required: false,
      },
      requestedDate: {
        type: Date,
        required: false,
      },
      requestAcceptedDate: {
        type: Date,
        required: false,
      },
      requestRejectedDate: {
        type: Date,
        required: false,
      },
      returnedDate: {
        type: Date,
        required: false,
      },
      reasonForReturn: {
        type: String,
        required: false,
      },
    },
  ],
  address: {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: true,
    },
    cityDistrictTown: {
      type: String,
      required: true,
    },
    localityAreaStreet: {
      type: String,
      required: true,
    },
    housenoBuildingApartment: {
      type: String,
      required: true,
    },
  },
  orderedDate: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    default: "Pending",
  },
  orderStatus: {
    type: String,
    default: "Pending",
  },
});

module.exports = mongoose.model("Order", orderSchema);
