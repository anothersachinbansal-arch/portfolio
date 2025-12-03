import Question from '../models/Question.js';

// Create a new question
export const createQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer } = req.body;
    const newQuestion = new Question({
      question,
      options,
      correctAnswer
    });
    
    const savedQuestion = await newQuestion.save();
    res.status(201).json({
      success: true,
      data: savedQuestion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all questions
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedQuestion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Question.findByIdAndDelete(id);
    
    if (!deletedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
