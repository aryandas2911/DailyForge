import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContext";

// eslint-disable-next-line react-refresh/only-export-components
export const TaskContext = createContext(null);

const TaskProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTasks = useCallback(async () => {
    if (!token) {
      setTasks([]);
      return [];
    }

    try {
      setLoading(true);
      const res = await api.get("/tasks");
      const nextTasks = res.data.tasks || [];
      setTasks(nextTasks);
      return nextTasks;
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to load tasks");
      setTasks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addTask = async (taskData) => {
    await api.post("/tasks", taskData);
    return getTasks();
  };

  const updateTask = async (id, updates) => {
    await api.put(`/tasks/${id}`, updates);
    return getTasks();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    return getTasks();
  };

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        getTasks,
        refreshTasks: getTasks,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider;
