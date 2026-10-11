import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Navbar = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header>
      <div className="logo">Budget Baby</div>
      <nav>
        <div>
          <Link className="link" to="/">
            Dashboard
          </Link>
        </div>
        <div>
          <Link className="link" to="/budget">
            Budget
          </Link>
        </div>
        <div>
          <Link className="link" to="/create-budget">
            Create Budget
          </Link>
        </div>
      </nav>

      <div className="auth">
        {isAuthenticated ? (
          <>
            Welcome back, {user?.userName || user?.email}
            <Link className="link" to="/sign-out">
              Sign out
            </Link>
          </>
        ) : (
          <>
            {" "}
            <Link className="link" to="/signin">
              Sign In
            </Link>
            <Link className="link btn-signup" to="/signup">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
