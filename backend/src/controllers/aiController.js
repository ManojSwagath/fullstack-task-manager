const Groq = require('groq-sdk');
const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * @desc    Get AI-powered task analysis and schedule recommendations
 * @route   POST /api/v1/ai/analyze
 * @access  Private
 */
const analyzeTasksAndSchedule = asyncHandler(async (req, res) => {
  const { question } = req.body;

  // Fetch user's tasks
  const tasks = await Task.find({ user: req.user.id }).sort({ priority: -1, dueDate: 1 });

  // Prepare task summary for AI
  const taskSummary = tasks.map(task => ({
    title: task.title,
    description: task.description || 'No description',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
    createdAt: new Date(task.createdAt).toLocaleDateString()
  }));

  // Count tasks by status and priority
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    mediumPriority: tasks.filter(t => t.priority === 'medium').length,
    lowPriority: tasks.filter(t => t.priority === 'low').length
  };

  const systemPrompt = `You are a helpful productivity and task management AI assistant. 
You help users manage their tasks, create schedules, and improve productivity.

The user has the following task statistics:
- Total Tasks: ${stats.total}
- Pending: ${stats.pending}
- In Progress: ${stats.inProgress}
- Completed: ${stats.completed}
- High Priority: ${stats.highPriority}
- Medium Priority: ${stats.mediumPriority}
- Low Priority: ${stats.lowPriority}

Here are their current tasks:
${JSON.stringify(taskSummary, null, 2)}

Based on this information, provide helpful advice about:
1. Which high-priority tasks they should focus on
2. Suggested time allocation for each task
3. A recommended daily/weekly schedule
4. Productivity tips specific to their workload

Be friendly, concise, and actionable. Use emojis to make it engaging. Format your response nicely with headers and bullet points.`;

  const userMessage = question || "Analyze my tasks and give me a productivity plan. What should I focus on today and how should I manage my schedule?";

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 1
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        taskStats: stats,
        model: 'llama-3.3-70b-versatile'
      }
    });
  } catch (error) {
    console.error('Groq API Error:', error.message);
    
    // Fallback response if API fails
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(400).json({
        success: false,
        message: 'Please configure your Groq API key in the .env file. Get one free at https://console.groq.com'
      });
    }

    res.status(500).json({
      success: false,
      message: 'AI service temporarily unavailable. Please try again later.'
    });
  }
});

/**
 * @desc    Chat with AI about tasks
 * @route   POST /api/v1/ai/chat
 * @access  Private
 */
const chatWithAI = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  // Fetch user's tasks for context
  const tasks = await Task.find({ user: req.user.id });
  
  const taskContext = `User has ${tasks.length} tasks: 
    ${tasks.filter(t => t.priority === 'high').length} high priority, 
    ${tasks.filter(t => t.status === 'pending').length} pending, 
    ${tasks.filter(t => t.status === 'in-progress').length} in progress.`;

  const systemPrompt = `You are a friendly AI productivity assistant named TaskBot. 
You help users manage their time, tasks, and create effective schedules.
${taskContext}

Be concise, friendly, and use emojis occasionally. Give practical, actionable advice.`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 800
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse
      }
    });
  } catch (error) {
    console.error('Groq API Error:', error.message);

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(400).json({
        success: false,
        message: 'Please configure your Groq API key. Get one free at https://console.groq.com'
      });
    }

    res.status(500).json({
      success: false,
      message: 'AI service temporarily unavailable'
    });
  }
});

/**
 * @desc    Generate a daily schedule based on tasks
 * @route   GET /api/v1/ai/schedule
 * @access  Private
 */
const generateSchedule = asyncHandler(async (req, res) => {
  const { workHours = 8, startTime = '09:00' } = req.query;

  const tasks = await Task.find({ 
    user: req.user.id,
    status: { $ne: 'completed' }
  }).sort({ priority: -1, dueDate: 1 });

  if (tasks.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        response: "🎉 Great news! You have no pending tasks. Enjoy your free time or plan ahead for upcoming projects!",
        schedule: []
      }
    });
  }

  const taskList = tasks.map(t => `- ${t.title} (${t.priority} priority, ${t.status})`).join('\n');

  const prompt = `Create a ${workHours}-hour daily schedule starting at ${startTime} for these tasks:
${taskList}

Format as a clear timetable with specific time slots. Include short breaks.
Prioritize high-priority tasks for peak productivity hours.
Be specific with time allocations (e.g., "09:00-10:30 - Task name").`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'You are a scheduling expert. Create practical, realistic daily schedules. Use emoji and clear formatting.' 
        },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 1000
    });

    const schedule = chatCompletion.choices[0]?.message?.content;

    res.status(200).json({
      success: true,
      data: {
        response: schedule,
        totalTasks: tasks.length,
        workHours: parseInt(workHours)
      }
    });
  } catch (error) {
    console.error('Groq API Error:', error.message);

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(400).json({
        success: false,
        message: 'Please configure your Groq API key. Get one free at https://console.groq.com'
      });
    }

    res.status(500).json({
      success: false,
      message: 'AI service temporarily unavailable'
    });
  }
});

module.exports = {
  analyzeTasksAndSchedule,
  chatWithAI,
  generateSchedule
};
