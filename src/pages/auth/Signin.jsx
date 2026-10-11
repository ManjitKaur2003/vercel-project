import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Signin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email.trim() || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await login(formData);
      setSuccess("Signed in successfully! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      // Extract user-friendly error message from backend
      let errMsg = "Invalid email or password.";
      if (!err.response) {
        errMsg = "Unable to connect to the backend server (http://localhost:3000). Please make sure your backend server is running.";
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-centered">
        <div className="auth-header centered">
          <h1>Welcome Back</h1>
          <p>
            Don't have an account? 
            <Link to="/signup">Sign up</Link>
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <AlertCircle className="alert-icon" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-container">
              <Mail className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-container">
              <Lock className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                placeholder="••••••••"
                onChange={handleChange}
                value={formData.password}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Sign In</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signin;
