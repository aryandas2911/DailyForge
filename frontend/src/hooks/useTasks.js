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
    await api.put(`/tasks/${id}`, updates);
    getTasks();
  };

  // delete task
  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    getTasks();
  };

  // reorder tasks
  const reorderTasks = async (taskIds) => {
    try {
      await api.put("/tasks/reorder", { taskIds });
      // Optimistically we might already have updated the state, 
      // but let's refresh to be sure or just trust the local state move.
      // For now, refreshing is safer.
      getTasks();
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to reorder tasks");
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
