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
  // remove instantly from UI
  setTasks((prev) => prev.filter((task) => task._id !== id));

  try {
    await api.delete(`/tasks/${id}`);
  } catch (error) {
    console.log(error?.response?.data?.message || "Failed to delete task");

    // reload tasks if delete failed
    getTasks();
  }
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
