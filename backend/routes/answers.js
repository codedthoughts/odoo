// backend/routes/answers.js

const express = require('express');
const router = express.Router();
const {
    postAnswer,
    voteAnswer,
    acceptAnswer,
    deleteAnswer
} = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');
const { postAnswerValidator } = require('../validators/questionValidators');
const validateRequest = require('../middleware/validateRequest');

// POST an answer to a specific question
// Note: We define this route here for better organization
router.post('/question/:questionId', protect, postAnswerValidator, validateRequest, postAnswer);

// POST a vote for a specific answer
router.post('/:answerId/vote', protect, voteAnswer);

// POST to accept a specific answer for a specific question
router.post('/question/:questionId/accept/:answerId', protect, acceptAnswer); // <-- THIS IS THE KEY FIX

// DELETE a specific answer
router.delete('/:answerId', protect, deleteAnswer); // <-- ADD THIS LINE

module.exports = router;