import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabaseClient } from "../supabase/client";

// Auth store
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      // Login function
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          set({ user: data.user, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Logout function
      logout: async () => {
        set({ loading: true });
        try {
          await supabaseClient.auth.signOut();
          set({ user: null, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Load user session
      loadUser: async () => {
        set({ loading: true });
        const { data } = await supabaseClient.auth.getUser();
        if (data.user) {
          set({ user: data.user });
        }
        set({ loading: false });
      },
    }),
    {
      name: "auth-store", // Name of the storage key
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);

export default useAuthStore;
