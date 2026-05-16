import {create} from "zustand";
import { getTasks, updateTask,addTask, deleteTask, bulkDeleteTasks } from "../api/tasksApi";
import { persist } from "zustand/middleware";

const useTaskStore = create(persist((set, get) => ({
  tasks: [],
  tasksLoading: true,
  
  fetchTasks: async () => {
      const fetchedTasks = await getTasks();
      // console.log(fetchedTasks);
      if(fetchedTasks){
        set((state)=>(
          {
            tasks: fetchedTasks,
            tasksLoading: false
          }
        ));
      }
      else{
        set((state)=>({tasksLoading: false}));
      }
      // console.log("zustand state",get().tasks);
  },
  
  updateTask: async (id, updates) => {
    
    set((state)=>({
      tasks: state.tasks.map(
        (task) => task._id === id ? {...task, ...updates} : task
      )
    }));
    
    await updateTask(id, updates);

  },

  deleteTask: async (id) => {
    set((state)=>({
      tasks: state.tasks.filter(
        (task) => task._id !== id
      )
    }));
    
    await deleteTask(id);

  },

  bulkDelete: async (ids) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => !ids.includes(task._id)),
    }));

    await bulkDeleteTasks(ids);
  },

  addTask: async (taskData) => {
    const newTask = await addTask(taskData);
    if(newTask){
      set((state)=>({
        tasks: [...state.tasks, newTask]
      }));
    }
    console.log("add tasks",newTask, get().tasks);
  },

  resetState: () => set({ tasks: [], tasksLoading: true }),
})
,{
  name: "task-storage",
}));

export default useTaskStore;