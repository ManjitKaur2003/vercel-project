import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace={true} />;
  }
  return <Outlet />;
};
export default ProtectedRoute;
