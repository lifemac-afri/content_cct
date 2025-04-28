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
import SubmissionsDashboard from "./pages/form_dashboards/SubmissionsDashboard";
import Layout from "./layout/Layout";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/submissions/ErrorBoundary";
import FormSubmissionsPage from "./components/submissions/FormSubmissionsPage";
import FormDetailPage from "./components/submissions/FormDetailPage";

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
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: <Navigate to="/console" replace />,
        },
        {
          path: "console",
          element: <DashboardConsole />,
        },
        {
          path: "console/form_submits",
          children: [
            {
              index: true,
              element: <SubmissionsDashboard />,
            },
            {
              path: ":formType",
              element: <FormSubmissionsPage />,
            },
            {
              path: ":formType/:id",
              element: <FormDetailPage />,
            },
          ],
        },
        // {
        //   path: "form_submits",
        //   element: (
        //     <ErrorBoundary>
        //       <SubmissionsDashboard />
        //     </ErrorBoundary>
        //   ),
        // },
        // {
        //   path: "form_dashboards/:id",
        //   element: (
        //     <ErrorBoundary>
        //       <FormDetailPage />
        //     </ErrorBoundary>
        //   ),
        // },
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
