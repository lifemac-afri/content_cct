import { create } from "zustand";
import { supabaseClient } from "../supabase/client";

const useBlogStore = create((set) => ({
  blogs: [],
  categories: [],
  loading: false,
  ploading: false,
  error: null,
  selectedBlog: null,

  fetchBlogById: async (id) => {
    set({ loading: true, error: null, selectedBlog: null });
    const { data, error } = await supabaseClient
      .from("blogs")
      .select("id, title, content, category, published, created_at")
      .eq("id", id)
      .single();
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set({ selectedBlog: data, loading: false });
    }
  },

  fetchBlogs: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabaseClient
      .from("blogs")
      .select("id, title, content, category, published ,created_at");
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set({ blogs: data, loading: false });
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabaseClient
      .from("categories")
      .select("id, name, created_at");
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set({ categories: data, loading: false });
    }
  },

  createBlog: async (newBlog) => {
    set({ loading: true, error: null });
    const { data, error } = await supabaseClient
      .from("blogs")
      .insert(newBlog)
      .select();
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set((state) => ({ blogs: [...state.blogs, ...data], loading: false }));
    }
  },

  publishBlog: async (id) => {
    set({ ploading: true, error: null });
    try {
      const { data, error } = await supabaseClient
        .from("blogs")
        .update({ published: true })
        .eq("id", id)
        .select();

      if (error) {
        set({ ploading: false, error: error.message });
        return false;
      } else {
        set((state) => ({
          blogs: state.blogs.map((blog) =>
            blog.id === id ? { ...blog, ...data[0] } : blog
          ),
          ploading: false,
        }));
        return true;
      }
    } catch (error) {
      set({ ploading: false, error: error.message });
      return false;
    }
  },

  createCategory: async (newCategory) => {
    set({ loading: true, error: null });
    const { data, error } = await supabaseClient
      .from("categories")
      .insert(newCategory)
      .select();
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set((state) => ({
        categories: [...state.categories, ...data],
        loading: false,
      }));
    }
  },

  editBlog: async (id, updatedBlog) => {
    set({ loading: true, error: null });
    const { data, error } = await supabaseClient
      .from("blogs")
      .update(updatedBlog)
      .eq("id", id)
      .select();
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set((state) => ({
        blogs: state.blogs.map((blog) =>
          blog.id === id ? { ...blog, ...data[0] } : blog
        ),
        loading: false,
      }));
    }
  },

  editCategory: async (id, updatedCategory) => {
    set({ loading: true, error: null });
    const { data, error } = await supabaseClient
      .from("categories")
      .update(updatedCategory)
      .eq("id", id)
      .select();
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? { ...category, ...data[0] } : category
        ),
        loading: false,
      }));
    }
  },

  deleteBlog: async (id) => {
    set({ loading: true, error: null });
    const { error } = await supabaseClient.from("blogs").delete().eq("id", id);
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set((state) => ({
        blogs: state.blogs.filter((blog) => blog.id !== id),
        loading: false,
      }));
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    const { error } = await supabaseClient
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        loading: false,
      }));
    }
  },
}));

export default useBlogStore;
