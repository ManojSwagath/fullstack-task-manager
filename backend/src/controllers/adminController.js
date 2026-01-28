const User = require('../models/User');
const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;

  // Build query
  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      users,
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
 * @desc    Get single user (Admin only)
 * @route   GET /api/v1/admin/users/:id
 * @access  Private/Admin
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's task count
  const taskCount = await Task.countDocuments({ user: user._id });

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      taskCount
    }
  });
});

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/v1/admin/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: user
  });
});

/**
 * @desc    Deactivate user (Admin only)
 * @route   PUT /api/v1/admin/users/:id/deactivate
 * @access  Private/Admin
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deactivating self
  if (user._id.toString() === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot deactivate your own account'
    });
  }

  user.isActive = false;
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully'
  });
});

/**
 * @desc    Activate user (Admin only)
 * @route   PUT /api/v1/admin/users/:id/activate
 * @access  Private/Admin
 */
const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isActive = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'User activated successfully'
  });
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deleting self
  if (user._id.toString() === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  // Delete user's tasks
  await Task.deleteMany({ user: user._id });

  // Delete user
  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User and associated tasks deleted successfully'
  });
});

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/v1/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const totalTasks = await Task.countDocuments();

  const tasksByStatus = await Task.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Recent users
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email role createdAt');

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers
      },
      tasks: {
        total: totalTasks,
        byStatus: tasksByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      },
      recentUsers
    }
  });
});

module.exports = {
  getAllUsers,
  getUser,
  updateUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
  getDashboardStats
};
