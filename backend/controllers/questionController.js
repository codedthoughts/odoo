const Question = require('../models/Question');
const Answer = require('../models/Answer');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Ask a new question
 * @route   POST /api/questions
 * @access  Private
 */
exports.askQuestion = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;
    
    const question = await Question.create({
        title,
        content,
        tags: tags.map(tag => tag.toLowerCase()),
        author: req.user.id
    });

    res.status(201).json(question);
});

/**
 * @desc    Get all questions with filtering, searching, and pagination
 * @route   GET /api/questions
 * @access  Public
 */
exports.getQuestions = asyncHandler(async (req, res) => {
    const { tag, sort, search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (tag) query.tags = tag;
    if (sort === 'unanswered') query.answers = { $size: 0 };
    if (search) query.$text = { $search: search };
    
    // Only show approved questions to non-admins
    if (!req.user || req.user.role !== 'admin') {
        query.status = 'approved';
    }

    const questions = await Question.find(query)
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
    
    const totalQuestions = await Question.countDocuments(query);

    res.json({
        questions,
        currentPage: page,
        totalPages: Math.ceil(totalQuestions / limit),
        totalQuestions
    });
});

/**
 * @desc    Get a single question by its ID
 * @route   GET /api/questions/:id
 * @access  Public
 */
exports.getQuestionById = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id)
        .populate('author', 'username')
        .populate({
            path: 'answers',
            populate: { path: 'author', select: 'username' },
            options: { sort: { 'upvotes': -1, 'createdAt': -1 } } // Sort answers by votes, then date
        });

    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    res.json(question);
});

/**
 * @desc    Delete a question
 * @route   DELETE /api/questions/:id
 * @access  Private (Author or Admin)
 */
exports.deleteQuestion = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    // Check if user is the author or an admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403); // Forbidden
        throw new Error('User not authorized to delete this question');
    }
    
    // Important: Also delete all answers associated with the question
    await Answer.deleteMany({ question: req.params.id });

    await question.deleteOne();

    res.json({ success: true, message: 'Question and associated answers removed' });
});

/**
 * @desc    Update a question
 * @route   PUT /api/questions/:id
 * @access  Private (Author only)
 */
exports.updateQuestion = asyncHandler(async (req, res) => {
    let question = await Question.findById(req.params.id);
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    // Only the author can update their question
    if (question.author.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized to update this question');
    }

    const { title, content, tags } = req.body;
    question.title = title || question.title;
    question.content = content || question.content;
    if(tags) {
        question.tags = tags.map(tag => tag.toLowerCase());
    }
    
    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
});