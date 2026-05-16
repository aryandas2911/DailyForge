import {create} from "zustand";
import { getTasks, updateTask,addTask, deleteTask } from "../api/tasksApi";
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

  addTask: async (taskData) => {
    const newTask = await addTask(taskData);
    if(newTask){
      set((state)=>({
        tasks: [...state.tasks, newTask]
      }));
    }
    console.log("add tasks",newTask, get().tasks);
  },

})
,{
  name: "task-storage",
}));

export default useTaskStore;