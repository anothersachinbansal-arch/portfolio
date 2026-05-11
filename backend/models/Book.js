import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  // Book Details
  bookId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  images: [{
    type: String,
    trim: true,
  }],
  
  // Inventory Management
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  
  // Book Categories/Tags
  category: {
    type: String,
    required: true,
    trim: true,
  },
  classLevel: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Additional Info
  author: {
    type: String,
    required: true,
    trim: true,
  },
  pages: {
    type: Number,
    required: true,
    min: 1,
  },
  language: {
    type: String,
    required: true,
    default: "English",
    trim: true,
  },
  
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
bookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-set availability based on quantity
  if (this.quantity <= 0) {
    this.isAvailable = false;
  } else {
    this.isAvailable = true;
  }
  
  next();
});

// Create indexes for better query performance
bookSchema.index({ bookId: 1 });
bookSchema.index({ title: 1 });
bookSchema.index({ isAvailable: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ classLevel: 1 });

const Book = mongoose.model("Book", bookSchema);

export default Book;
