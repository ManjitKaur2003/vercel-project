import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle } from "lucide-react";
import Lottie from "lottie-react";
import bear from "../../lottie/DancingBear.json";
import apiClient from "../../ApiClient/interceptor";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [visible, setVisible] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const signup = async (data) => {
    const response = await apiClient.post("auth/signup", data);
    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.userName.trim() || !formData.email.trim() || !formData.password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await signup(formData);
      setSuccess("Account created successfully! Redirecting to sign in...");
      setFormData({
        userName: "",
        email: "",
        password: "",
      });
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (err) {
      let errMsg = "Registration failed. Please check your inputs.";
      if (!err.response) {
        errMsg = "Unable to connect to the backend server (http://localhost:3000). Please make sure your backend server is running.";
      } else if (typeof err.response?.data === "string") {
        errMsg = err.response.data;
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const LottieComponent = Lottie.default || Lottie;

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-container">
        
        {/* Left column - Mascot & Branding */}
        <div className="auth-split-left">
          <div className="mascot-container">
            <LottieComponent animationData={bear} loop={true} />
          </div>
          <div className="brand-pitch">
            <h2>Budget Baby</h2>
            <p>Your playful companion for smart, simple, and automated expense tracking.</p>
          </div>
        </div>

        {/* Right column - Form */}
        <div className="auth-split-right">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>
              Already have an account?
              <Link to="/signin">Sign in</Link>
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
              <label className="form-label" htmlFor="userName">Username</label>
              <div className="input-container">
                <User className="input-icon" />
                <input
                  id="userName"
                  type="text"
                  name="userName"
                  className="form-input"
                  placeholder="johndoe"
                  onChange={handleChange}
                  value={formData.userName}
                  required
                />
              </div>
            </div>

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
                  type={visible ? "password" : "text"}
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
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? "Show password" : "Hide password"}
                >
                  {visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus size={18} />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Signup;
