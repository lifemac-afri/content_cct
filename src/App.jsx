import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
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
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  const router = createBrowserRouter([
    {
      path: "/signin",
      element: <SignIn />,
    },

    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          index: true,
          element: (
            <ProtectedRoute>
              <Navigate to="/console" replace />
            </ProtectedRoute>
          ),
        },
        {
          path: "console",
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
