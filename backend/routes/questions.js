// backend/routes/questions.js

const express = require('express');
const router = express.Router();
const {
    getQuestions,
    getQuestionById,
    askQuestion,
    updateQuestion, // <-- Import updateQuestion
    deleteQuestion  // <-- Import deleteQuestion
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');
const { askQuestionValidator } = require('../validators/questionValidators');
const validateRequest = require('../middleware/validateRequest');

// Routes for '/api/questions'
router.route('/')
    .get(getQuestions)
    .post(protect, askQuestionValidator, validateRequest, askQuestion);

// Routes for '/api/questions/:id'
router.route('/:id')
    .get(getQuestionById)
    .put(protect, updateQuestion)    // <-- ADD THIS LINE
    .delete(protect, deleteQuestion); // <-- ADD THIS LINE

module.exports = router;