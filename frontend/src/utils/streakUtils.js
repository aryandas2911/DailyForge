export const calculateDashboardStats = (tasks = []) => {
    const today = new Date();
    const completedTasks = tasks.filter(
      (task) => task.status === "Completed"
    );
    const completedToday = completedTasks.filter((task) => {
      const date = new Date(task.updatedAt);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    });
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const weeklyCompleted = completedTasks.filter(
      (task) => new Date(task.updatedAt) >= oneWeekAgo
    );
    const streak = calculateStreak(completedTasks); 
    return {
      completedToday: completedToday.length,
      weeklyCompleted: weeklyCompleted.length,
      streak,
    };
  };
  const calculateStreak = (completedTasks) => {
    if (!completedTasks.length) return 0;
    const completedDays = new Set();
    completedTasks.forEach((task) => {
      const date = new Date(task.updatedAt);
      const formatted = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      completedDays.add(formatted);
    });
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const formatted = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (completedDays.has(formatted)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  export const getAchievements = (tasks = [], streak = 0) => {
    const completedCount = tasks.filter(
      (task) => task.status === "Completed"
    ).length;
    const achievements = [];
    if (completedCount >= 1) {
      achievements.push({
        icon: "🚀",
        title: "Starter",
        description: "Completed your first task",
      });
    }
    if (streak >= 3) {
      achievements.push({
        icon: "🔥",
        title: "Consistent",
        description: "3 day productivity streak",
      });
    }
    if (streak >= 7) {
      achievements.push({
        icon: "🏆",
        title: "Productivity Master",
        description: "7 day streak achieved",
      });
    }
    if (completedCount >= 20) {
      achievements.push({
        icon: "✅",
        title: "Task Crusher",
        description: "Completed 20 tasks",
      });
    }
    return achievements;
  };