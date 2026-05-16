import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem("token") || null,
      authLoading: false,

      // Initialize auth state (restore session)
      initAuth: async () => {
        const token = get().token;
        if (!token) return;

        set({ authLoading: true });
        try {
          const res = await api.get("/auth/me");
          set({ user: res.data.user });
        } catch (error) {
          console.error("Session restoration failed:", error);
          get().logout();
        } finally {
          set({ authLoading: false });
        }
      },

      setUser: (user) => set({ user }),

      setToken: (token) => {
        if (token) {
          localStorage.setItem("token", token);
          set({ token });
        } else {
          get().logout();
        }
      },

      logout: () => {
        localStorage.clear();
        set({ user: null, token: null });
      },

      register: async (userData) => {
        set({ authLoading: true });
        try {
          const res = await api.post("/auth/signup", userData);
          const { token } = res.data;
          set({ token });
          localStorage.setItem("token", token);
          
          // Fetch user data from /me
          const userRes = await api.get("/auth/me");
          set({ user: userRes.data.user });

          return { success: true };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || "Registration failed",
          };
        } finally {
          set({ authLoading: false });
        }
      },

      login: async (credentials) => {
        set({ authLoading: true });
        try {
          const res = await api.post("/auth/login", credentials);
          const { token } = res.data;
          set({ token });
          localStorage.setItem("token", token);

          // Fetch user data from /me
          const userRes = await api.get("/auth/me");
          set({ user: userRes.data.user });

          return { success: true };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || "Login failed",
          };
        } finally {
          set({ authLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }), // Only persist the token
    }
  )
);

export default useAuthStore;
