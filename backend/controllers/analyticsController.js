import Task from "../src/models/Task.js";
import User from "../src/models/User.js";

// get analytics summary function
export const getAnalyticsSummary = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, token invalid" });
    }

    // get start of current week (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // total tasks created by user
    const totalTasks = await Task.countDocuments({ userId });

    // total completed tasks
    const completedTasks = await Task.countDocuments({
      userId,
      status: "Completed",
    });

    // total due tasks
    const dueTasks = await Task.countDocuments({
      userId,
      status: "Due",
    });

    // tasks completed this week
    const completedThisWeek = await Task.countDocuments({
      userId,
      status: "Completed",
      updatedAt: { $gte: startOfWeek },
    });

    // priority breakdown using aggregation
    const priorityBreakdown = await Task.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // status breakdown using aggregation
    const statusBreakdown = await Task.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // most productive day — day with most completed tasks
    const productiveDays = await Task.aggregate([
      {
        $match: {
          userId: user._id,
          status: "Completed",
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$updatedAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    // convert day number to day name
    const dayNames = [
      "", "Sunday", "Monday", "Tuesday",
      "Wednesday", "Thursday", "Friday", "Saturday",
    ];
    const mostProductiveDay =
      productiveDays.length > 0
        ? dayNames[productiveDays[0]._id]
        : "No data yet";

    // overdue tasks — due date passed but not completed
    const overdueTasks = await Task.countDocuments({
      userId,
      status: "Due",
      dueDate: { $lt: now },
    });

    return res.status(200).json({
      success: true,
      analytics: {
        totalTasks,
        completedTasks,
        dueTasks,
        overdueTasks,
        completedThisWeek,
        mostProductiveDay,
        priorityBreakdown,
        statusBreakdown,
      },
    });
  } catch (error) {
    // error handling
    console.log("Error fetching analytics", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching analytics" });
  }
};