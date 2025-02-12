import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabaseClient } from "../supabase/client";

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
          const { error } = await supabaseClient.auth.signOut();
          if (error) throw error;

          set({ user: null, loading: false, error: null });
          return true; // Return true to indicate successful logout
        } catch (error) {
          set({ error: error.message, loading: false });
          return false; // Return false to indicate failed logout
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
      name: "auth-store",
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;
