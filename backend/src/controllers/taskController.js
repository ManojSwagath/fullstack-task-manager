const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all tasks for logged in user
 * @route   GET /api/v1/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, search, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Build query
  const query = { user: req.user.id };

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by priority
  if (priority) {
    query.priority = priority;
  }

  // Search in title and description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  // Execute query
  const tasks = await Task.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Task.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

/**
 * @desc    Get single task
 * @route   GET /api/v1/tasks/:id
 * @access  Private
 */
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

/**
 * @desc    Create new task
 * @route   POST /api/v1/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  // Add user to request body
  req.body.user = req.user.id;

  const task = await Task.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
});

/**
 * @desc    Update task
 * @route   PUT /api/v1/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Update task
  task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

/**
 * @desc    Delete task
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});

/**
 * @desc    Get task statistics
 * @route   GET /api/v1/tasks/stats
 * @access  Private
 */
const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await Task.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const priorityStats = await Task.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  // Format stats
  const statusCounts = {
    pending: 0,
    'in-progress': 0,
    completed: 0
  };

  stats.forEach(stat => {
    statusCounts[stat._id] = stat.count;
  });

  const priorityCounts = {
    low: 0,
    medium: 0,
    high: 0
  };

  priorityStats.forEach(stat => {
    priorityCounts[stat._id] = stat.count;
  });

  const totalTasks = await Task.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    data: {
      total: totalTasks,
      byStatus: statusCounts,
      byPriority: priorityCounts
    }
  });
});

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};
