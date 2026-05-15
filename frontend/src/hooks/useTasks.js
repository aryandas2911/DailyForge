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
    setLoading(true);
    await api.post("/tasks", taskData);
    await getTasks();
  };

  // update task
  const updateTask = async (id, updates) => {
    setLoading(true);
    await api.put(`/tasks/${id}`, updates);
    await getTasks();
  };

  // delete task
  const deleteTask = async (id) => {
    setLoading(true);
    await api.delete(`/tasks/${id}`);
    await getTasks();
  };

  // initial fetch
  useEffect(() => {
    getTasks();
  }, []);

  // return reusable functions
  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
  };
};

export default useTasks;