import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  // User Details
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Book Details
  bookId: {
    type: String,
    required: true,
  },
  bookTitle: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  
  // Payment Details
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
  },
  razorpay_signature: {
    type: String,
  },
  
  // Transaction Status
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  
  // Additional Info
  receipt: {
    type: String,
    required: true,
  },
  
  // Notes for storing additional information like error details
  notes: {
    type: Object,
    default: {},
  },
  
  // Delivery Information
  delivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  
  // Email Status Flags
  orderedEmail: {
    type: Boolean,
    default: false,
  },
  deliveredEmail: {
    type: Boolean,
    default: false,
  },
  
  // Admin Notes
  adminNotes: [{
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    id: {
      type: Number,
      required: true
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
paymentSchema.index({ razorpay_order_id: 1 });
paymentSchema.index({ razorpay_payment_id: 1 });
paymentSchema.index({ email: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
