const express = require('express');
const router = express.Router();
const {
  analyzeTasksAndSchedule,
  chatWithAI,
  generateSchedule
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /ai/analyze:
 *   post:
 *     summary: Get AI-powered task analysis and productivity recommendations
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: "What should I focus on today?"
 *     responses:
 *       200:
 *         description: AI analysis response
 */
router.post('/analyze', analyzeTasksAndSchedule);

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with AI assistant about tasks and productivity
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "How can I be more productive?"
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: AI chat response
 */
router.post('/chat', chatWithAI);

/**
 * @swagger
 * /ai/schedule:
 *   get:
 *     summary: Generate AI-powered daily schedule based on tasks
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workHours
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of work hours per day
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *           default: "09:00"
 *         description: Work start time
 *     responses:
 *       200:
 *         description: Generated schedule
 */
router.get('/schedule', generateSchedule);

module.exports = router;
