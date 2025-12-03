import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [optionSchema],
  correctAnswer: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Question', questionSchema);
