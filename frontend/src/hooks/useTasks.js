import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;

const useTasks = ({
  initialPage = DEFAULT_PAGE,
  initialLimit = DEFAULT_LIMIT,
} = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState({
    totalTasks: 0,
    totalPages: 0,
    currentPage: initialPage,
    limit: initialLimit,
  });

  // fetch tasks from database
  const getTasks = useCallback(async (pageToFetch = page) => {
    try {
      setLoading(true);
      const response = await api.get("/tasks", {
        params: {
          page: pageToFetch,
          limit: initialLimit,
        },
      });
      const data = response.data;
      const totalPages = data.totalPages || 0;

      if (totalPages > 0 && pageToFetch > totalPages) {
        setPage(totalPages);
        return;
      }

      setTasks(data.tasks || []);
      setPagination({
        totalTasks: data.totalTasks || 0,
        totalPages,
        currentPage: data.currentPage || pageToFetch,
        limit: data.limit || initialLimit,
      });
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [initialLimit, page]);

  // create new task
  const addTask = async (taskData) => {
    try {
      const response = await api.post("/tasks", taskData);

      console.log("Task added:", response.data);

      if (page === DEFAULT_PAGE) {
        await getTasks(DEFAULT_PAGE);
      } else {
        setPage(DEFAULT_PAGE);
      }
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log(
        error?.response?.data?.message || error?.response?.data || error.message
      );
      alert(error?.response?.data?.message || "Failed to create task");
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
      await getTasks(page);
    } catch (error) {
      console.log(error?.response?.data?.message || "Failed to update task");
      await getTasks(page);
    }
  };

  // delete task
  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    await getTasks(page);
  };

  // bulk delete tasks
  const bulkDelete = async (ids) => {
    await api.post("/tasks/bulk-delete", { ids });
    await getTasks(page);
  };

  // bulk edit tasks
  const bulkUpdate = async (ids, updates) => {
    await Promise.all(ids.map((id) => api.put(`/tasks/${id}`, updates)));
    await getTasks(page);
  };

  // initial fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getTasks();
  }, [getTasks]);

  // return reusable functions
  return {
    tasks,
    loading,
    pagination,
    page,
    setPage,
    addTask,
    updateTask,
    deleteTask,
    bulkDelete,
    bulkUpdate,
  };
};

export default useTasks;
