import { useEffect, useState } from "react";
import api from "../api/axios";

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch tasks from database
  const getTasks = async () => {
    try {
      setLoading(true);
      const tasks = await api.get("/tasks");
      setTasks(tasks.data.tasks);
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // create new task
  const addTask = async (taskData) => {
    try {
      await api.post("/tasks", taskData);
      getTasks();
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error(
          error.response.data?.message ||
            "Task with the same title and due date already exists"
        );
      }
      throw error;
    }
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
    setLoading(true);
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
    setLoading(false);
  };

  // initial fetch
  useEffect(() => {
    getTasks();
  }, []);

  // bulk delete tasks
  const bulkDelete = async (ids) => {
    await api.post("/tasks/bulk-delete", { ids });
    getTasks();
  };

  // return reusable functions
  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    bulkDelete,
  };
};

export default useTasks;