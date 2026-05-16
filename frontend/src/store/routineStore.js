import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addRoutine, fetchRoutines } from "../api/routinesApi";

const useRoutineStore = create(
  persist(
    (set, get) => ({
      routines: [],
      routinesLoading: true,

      fetchRoutines: async () => {
        try {
          const routines = await fetchRoutines();
          if(routines){
            set({ routines });
          }
        } catch (err) {
          console.error(err);
        } finally {
          set({ routinesLoading: false });
        }
      },

      addRoutine: async (routineData) => {
        const success = await addRoutine(routineData);
        if (success) {
          await get().fetchRoutines();
        }
      },

      updateRoutine: async (id, updates) => {
        // TODO: Implement updateRoutine logic
      },

      deleteRoutine: async (id) => {
        // TODO: Implement deleteRoutine logic
      },
    }),
    {
      name: "routine-storage",
    }
  )
);

export default useRoutineStore;
