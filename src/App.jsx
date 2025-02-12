import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import {
  AddBlogPage,
  BlogsPage,
  CategoryManagementPage,
  CreateCategoryPage,
  DashboardConsole,
  EditBlogPage,
  NotFound,
  SignIn,
  ViewBlogPage,
} from "./pages";
import Layout from "./layout/Layout";
import { Toaster } from "react-hot-toast";

function App() {
  const router = createBrowserRouter([
    {
      path: "/signin",
      element: <SignIn />,
    },

    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "console",
          index: true,
          element: <DashboardConsole />,
        },
        {
          path: "posts",
          element: <BlogsPage />,
        },
        {
          path: "posts/add",
          element: <AddBlogPage />,
        },
        {
          path: "posts/:id",
          element: <ViewBlogPage />,
        },
        {
          path: "posts/:id/edit",
          element: <EditBlogPage />,
        },
        {
          path: "categories",
          element: <CategoryManagementPage />,
        },
        {
          path: "categories/add",
          element: <CreateCategoryPage />,
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
