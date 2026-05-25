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
    await api.delete(`/tasks/${id}`);
    // fix : This line refreshes the UI!
    setTasks(prev => prev.filter(t => t._id !== id)); 
  };

  // initial fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getTasks();
  }, []);
  // bulk delete tasks
  const bulkDelete = async (ids) => {
    await api.post("/tasks/bulk-delete", { ids });
    getTasks();
  };
  // bulk edit tasks
  const bulkUpdate = async (ids, updates) => {
    await Promise.all(ids.map((id) => api.put(`/tasks/${id}`, updates)));
    await getTasks();
  };
  // return reusable functions
  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    bulkDelete,
    bulkUpdate,
  };
};

export default useTasks;
