import { useEffect, useState } from "react";
import api from "../api/axios";

const useTasks = () => {
  const [tasks, setTasks] = useState([]);

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
    await api.post("/tasks", taskData);
    getTasks();
  };

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
    // Keep a backup of tasks in case of error
    const previousTasks = [...tasks];
    // fix : This line refreshes the UI!
    setTasks(prev => prev.filter(t => t._id !== id)); 
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to delete task");
      // Rollback on failure
      setTasks(previousTasks);
    }
  };

  // initial fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getTasks();
  }, []);
  // bulk delete tasks
  const bulkDelete = async (ids) => {
    try {
      await api.post("/tasks/bulk-delete", { ids });
      getTasks();
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to bulk delete tasks");
      getTasks();
    }
  };
  // return reusable functions
  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    bulkDelete,
  };
};

export default useTasks;
