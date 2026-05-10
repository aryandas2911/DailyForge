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

  // initial fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getTasks();
  }, []);

  // return reusable functions
  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
  };
};

export default useTasks;
