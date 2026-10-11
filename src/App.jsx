import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./common/Layout";
import Dahsboard from "./pages/Dahsboard";
import Budget from "./pages/Budget";
import CreateBudget from "./pages/CreateBudget";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import { AuthProvider } from "./context/AuthContext";
import SignOut from "./pages/auth/SignOut";
import ProtectedRoute from "./utils/ProtectedRoute";
import BudgetDetails from "./pages/BudgetDetails";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Dahsboard />,
        },
        {
          path: "/budget",
          element: <Budget />,
        },

        {
          path: "/signin",
          element: <Signin />,
        },
        {
          path: "/signup",
          element: <Signup />,
        },
        {
          path: "/sign-out",
          element: <SignOut />,
        },

        {
          element: <ProtectedRoute />,
          children: [
            {
              path: "/create-budget",
              element: <CreateBudget />,
            },
            {
              path: "/budget/:budgetId",
              element: <BudgetDetails />,
            },
          ],
        },
      ],
    },
  ]);

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
