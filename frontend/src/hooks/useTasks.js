import { useEffect, useState } from "react";
import api from "../api/axios";

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [recentlyDeletedTasks, setRecentlyDeletedTasks] = useState([]);

  // fetch tasks from database
  const getTasks = async () => {
    try {
      const tasks = await api.get("/tasks");
      setTasks(tasks.data.tasks);
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to load tasks");
    }
  };

  // create new task
  const addTask = async (taskData) => {
  try {
    const response = await api.post("/tasks", taskData);

    console.log("Task added:", response.data);

    // instantly update UI
    setTasks((prev) => [response.data.newTask, ...prev]);

  } catch (error) {

    console.log("FULL ERROR:", error);

    console.log(
      error?.response?.data?.message ||
      error?.response?.data ||
      error.message
    );

    alert(
      error?.response?.data?.message ||
      "Failed to create task"
    );
  }
};

  const toTaskPayload = (task) => ({
    title: task.title,
    description: task.description,
    tags: task.tags || [],
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
  });

  // update task
  const updateTask = async (id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...updates } : t))
    );
    try {
      await api.put(`/tasks/${id}`, updates);
      await getTasks();
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to update task");
      await getTasks();
    }
  };

  // delete task
  const deleteTask = async (id) => {
    const deletedTask = tasks.find((task) => task._id === id);
    await api.delete(`/tasks/${id}`);
    if (deletedTask) {
      setRecentlyDeletedTasks([deletedTask]);
    }
    setTasks((prev) => prev.filter((task) => task._id !== id));
  };

  const undoDelete = async () => {
    if (!recentlyDeletedTasks.length) return;

    await Promise.all(
      recentlyDeletedTasks.map((task) => api.post("/tasks", toTaskPayload(task)))
    );
    setRecentlyDeletedTasks([]);
    await getTasks();
  };

  const clearUndo = () => {
    setRecentlyDeletedTasks([]);
  };

  // initial fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getTasks();
  }, []);
  // bulk delete tasks
  const bulkDelete = async (ids) => {
    const deletedTasks = tasks.filter((task) => ids.includes(task._id));
    await api.post("/tasks/bulk-delete", { ids });
    setRecentlyDeletedTasks(deletedTasks);
    setTasks((prev) => prev.filter((task) => !ids.includes(task._id)));
  };
  // return reusable functions
  return {
    tasks,
    recentlyDeletedTasks,
    addTask,
    updateTask,
    deleteTask,
    undoDelete,
    clearUndo,
    bulkDelete,
  };
};

export default useTasks;
