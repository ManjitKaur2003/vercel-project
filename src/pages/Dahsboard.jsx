import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../ApiClient/interceptor";
import { useAuth } from "../context/AuthContext";
import {
  Wallet,
  Plus,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  IndianRupee,
  Activity,
  ShoppingBag,
  Sparkles,
  PieChart,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  X,
  CreditCard,
  ShieldCheck,
  Zap,
} from "lucide-react";

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CATEGORY_COLORS = [
  "#6366f1", // Indigo
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#3b82f6", // Blue
  "#14b8a6", // Teal
];

const Dahsboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Dashboard Data State
  const [data, setData] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    totalBudgets: 0,
    totalPurchases: 0,
    burnRate: 0,
    activeBudgetsCount: 0,
    budgets: [],
    recentPurchases: [],
    categoryBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Quick Add Expense Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({
    budgetId: "",
    title: "",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // Fetch Dashboard Data
  const fetchDashboard = async (isManualRefresh = false) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const response = await apiClient.get("/dashboard/get");
      setData(response.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchDashboard();
    }
  }, [isAuthenticated, authLoading]);

  // Handle Quick Add Expense
  const handleOpenModal = () => {
    // Pre-select first active budget if available
    const firstBudget = data.budgets?.find((b) => !b.isDone) || data.budgets?.[0];
    setModalForm({
      budgetId: firstBudget ? firstBudget._id : "",
      title: "",
      amount: "",
      note: "",
      date: new Date().toISOString().split("T")[0],
    });
    setModalError("");
    setModalSuccess("");
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.budgetId || !modalForm.title || !modalForm.amount) {
      setModalError("Please select a budget, title, and valid amount.");
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError("");

      await apiClient.post("/purchase/create", {
        budgetId: modalForm.budgetId,
        title: modalForm.title.trim(),
        amount: Number(modalForm.amount),
        note: modalForm.note ? modalForm.note.trim() : "",
        date: modalForm.date ? new Date(modalForm.date) : new Date(),
      });

      setModalSuccess("Expense recorded successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess("");
        fetchDashboard(true);
      }, 700);
    } catch (err) {
      console.error("Add purchase error:", err);
      setModalError(
        err.response?.data?.message || "Failed to log expense. Please try again."
      );
    } finally {
      setModalSubmitting(false);
    }
  };

  // Dynamic Greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const currentPeriod = useMemo(() => {
    const now = new Date();
    return `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
  }, []);

  // Top spending category
  const topCategory = useMemo(() => {
    if (!data.categoryBreakdown || data.categoryBreakdown.length === 0) return null;
    return data.categoryBreakdown[0];
  }, [data.categoryBreakdown]);

  // If user is guest / unauthenticated, show stunning landing preview
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="dashboard-page-container">
        <div className="guest-dashboard-hero">
          <div className="guest-hero-badge">
            <Sparkles size={15} />
            <span>Smart Personal Finance</span>
          </div>

          <h1 className="guest-hero-title">
            Take Control of Every Rupee with{" "}
            <span className="guest-hero-highlight">Budget Baby</span>
          </h1>

          <p className="guest-hero-desc">
            Precision category budgeting, instant real-time expense tracking, and
            actionable financial insights — all wrapped in an ultra-premium,
            distraction-free dark aesthetic.
          </p>

          <div className="guest-hero-actions">
            <Link to="/signup" className="btn-primary-action">
              <Zap size={18} />
              <span>Get Started Free</span>
            </Link>
            <Link to="/signin" className="btn-secondary-action">
              <span>Sign In to Your Vault</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Interactive Mock Preview Deck */}
          <div className="guest-preview-deck">
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card">
                <div className="dashboard-stat-top">
                  <div className="dashboard-stat-icon stat-indigo">
                    <IndianRupee size={22} />
                  </div>
                  <span className="dashboard-stat-pill pill-indigo">Allocated</span>
                </div>
                <div className="dashboard-stat-value">₹45,000</div>
                <div className="dashboard-stat-label">Total Monthly Budget</div>
                <div className="mini-progress-bar">
                  <div
                    className="mini-progress-fill"
                    style={{
                      width: "65%",
                      background: "linear-gradient(90deg, #6366f1, #06b6d4)",
                    }}
                  ></div>
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-top">
                  <div className="dashboard-stat-icon stat-amber">
                    <TrendingUp size={22} />
                  </div>
                  <span className="dashboard-stat-pill pill-amber">Tracked</span>
                </div>
                <div className="dashboard-stat-value">₹24,800</div>
                <div className="dashboard-stat-label">Total Spent</div>
                <div className="mini-progress-bar">
                  <div
                    className="mini-progress-fill"
                    style={{
                      width: "55%",
                      background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                    }}
                  ></div>
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-top">
                  <div className="dashboard-stat-icon stat-emerald">
                    <CheckCircle2 size={22} />
                  </div>
                  <span className="dashboard-stat-pill pill-emerald">+ Safe</span>
                </div>
                <div className="dashboard-stat-value">₹20,200</div>
                <div className="dashboard-stat-label">Available Balance</div>
                <div className="mini-progress-bar">
                  <div
                    className="mini-progress-fill"
                    style={{ width: "45%", background: "#10b981" }}
                  ></div>
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-top">
                  <div className="dashboard-stat-icon stat-cyan">
                    <Activity size={22} />
                  </div>
                  <span className="dashboard-stat-pill pill-cyan">55% Burn</span>
                </div>
                <div className="dashboard-stat-value">55%</div>
                <div className="dashboard-stat-label">Budget Utilization</div>
                <div className="mini-progress-bar">
                  <div
                    className="mini-progress-fill"
                    style={{
                      width: "55%",
                      background: "linear-gradient(90deg, #06b6d4, #10b981)",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="guest-features-grid">
            <div className="guest-feature-box">
              <div className="guest-feature-icon">
                <Layers size={22} />
              </div>
              <h3 className="guest-feature-title">Category Limits</h3>
              <p className="guest-feature-desc">
                Set dedicated spending ceilings for food, housing, bills, travel,
                and lifestyle. Never overspend without noticing.
              </p>
            </div>

            <div className="guest-feature-box">
              <div className="guest-feature-icon">
                <ShoppingBag size={22} />
              </div>
              <h3 className="guest-feature-title">Instant Expense Logs</h3>
              <p className="guest-feature-desc">
                Record receipts and expenditures in under 5 seconds with instant
                budget deduction and timestamped history.
              </p>
            </div>

            <div className="guest-feature-box">
              <div className="guest-feature-icon">
                <Sparkles size={22} />
              </div>
              <h3 className="guest-feature-title">Real-Time Pulse</h3>
              <p className="guest-feature-desc">
                Visual burn rates, color-coded health meters, and automatic
                utilization alerts protect your financial future.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page-container">
      {/* 1. Header Bar */}
      <div className="dashboard-header-row">
        <div className="dashboard-welcome-box">
          <div className="dashboard-user-avatar">
            {user?.userName
              ? user.userName.substring(0, 2).toUpperCase()
              : user?.email
              ? user.email.substring(0, 2).toUpperCase()
              : "BB"}
          </div>
          <div>
            <h1 className="dashboard-greeting-title">
              {greeting},{" "}
              <span>{user?.userName || user?.email?.split("@")[0] || "Friend"}</span>
            </h1>
            <p className="dashboard-subtitle">
              <span>Financial Pulse Overview</span>
              <span className="dashboard-period-tag">
                <Calendar size={12} />
                {currentPeriod}
              </span>
            </p>
          </div>
        </div>

        <div className="dashboard-header-actions">
          <button
            onClick={() => fetchDashboard(true)}
            className={`btn-icon-refresh ${refreshing ? "spinning" : ""}`}
            title="Refresh dashboard stats"
            disabled={refreshing}
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={handleOpenModal}
            className="btn-primary-action"
            title="Log a new transaction"
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>

          <Link to="/create-budget" className="btn-secondary-action">
            <Layers size={18} />
            <span>New Budget</span>
          </Link>
        </div>
      </div>

      {/* 2. Loading or Error Banner */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Syncing your financial dashboard...</p>
        </div>
      ) : error ? (
        <div className="empty-state-card">
          <AlertTriangle size={36} color="#ef4444" />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button
            onClick={() => fetchDashboard()}
            className="btn-primary-action"
            style={{ marginTop: "1rem" }}
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        <>
          {/* 3. Top 4 Metric Stat Cards */}
          <div className="dashboard-stats-grid">
            {/* Card 1: Total Budget */}
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <div className="dashboard-stat-icon stat-indigo">
                  <IndianRupee size={22} />
                </div>
                <span className="dashboard-stat-pill pill-indigo">
                  {data.activeBudgetsCount} Active
                </span>
              </div>
              <div className="dashboard-stat-value">
                ₹{Number(data.totalBudget || 0).toLocaleString()}
              </div>
              <div className="dashboard-stat-label">Total Allocated Limit</div>
              <div className="dashboard-stat-foot">
                <span>Across {data.totalBudgets} categories</span>
                <Link
                  to="/budget"
                  style={{ color: "var(--accent-indigo)", textDecoration: "none" }}
                >
                  Manage →
                </Link>
              </div>
            </div>

            {/* Card 2: Total Spent */}
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <div className="dashboard-stat-icon stat-amber">
                  <TrendingUp size={22} />
                </div>
                <span className="dashboard-stat-pill pill-amber">Outflow</span>
              </div>
              <div className="dashboard-stat-value">
                ₹{Number(data.totalSpent || 0).toLocaleString()}
              </div>
              <div className="dashboard-stat-label">Total Expenses Tracked</div>
              <div className="dashboard-stat-foot">
                <span>{data.totalPurchases} purchases logged</span>
                <span style={{ color: "#fbbf24" }}>
                  {data.burnRate}% of limit
                </span>
              </div>
            </div>

            {/* Card 3: Net Remaining */}
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <div
                  className={`dashboard-stat-icon ${
                    data.remaining >= 0 ? "stat-emerald" : "stat-rose"
                  }`}
                >
                  <CheckCircle2 size={22} />
                </div>
                <span
                  className={`dashboard-stat-pill ${
                    data.remaining >= 0 ? "pill-emerald" : "pill-rose"
                  }`}
                >
                  {data.remaining >= 0 ? "Surplus Safe" : "Limit Exceeded"}
                </span>
              </div>
              <div
                className="dashboard-stat-value"
                style={{
                  color: data.remaining >= 0 ? "#34d399" : "#f87171",
                }}
              >
                ₹{Number(data.remaining || 0).toLocaleString()}
              </div>
              <div className="dashboard-stat-label">Net Available Margin</div>
              <div className="dashboard-stat-foot">
                <span>
                  {data.remaining >= 0
                    ? "Safe within targets"
                    : `Over budget by ₹${Math.abs(data.remaining).toLocaleString()}`}
                </span>
                <span style={{ color: "var(--text-muted)" }}>This period</span>
              </div>
            </div>

            {/* Card 4: Budget Utilization */}
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <div className="dashboard-stat-icon stat-cyan">
                  <Activity size={22} />
                </div>
                <span
                  className={`dashboard-stat-pill ${
                    data.burnRate > 100
                      ? "pill-rose"
                      : data.burnRate >= 80
                      ? "pill-amber"
                      : "pill-cyan"
                  }`}
                >
                  {data.burnRate > 100
                    ? "Exceeded"
                    : data.burnRate >= 80
                    ? "Caution"
                    : "Healthy"}
                </span>
              </div>
              <div className="dashboard-stat-value">{data.burnRate}%</div>
              <div className="dashboard-stat-label">Budget Burn Rate</div>
              <div className="mini-progress-bar">
                <div
                  className="mini-progress-fill"
                  style={{
                    width: `${Math.min(data.burnRate, 100)}%`,
                    background:
                      data.burnRate > 100
                        ? "#ef4444"
                        : data.burnRate >= 80
                        ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                        : "linear-gradient(90deg, var(--accent-indigo), var(--accent-cyan))",
                  }}
                ></div>
              </div>
              <div className="dashboard-stat-foot">
                <span>
                  {data.burnRate > 100
                    ? "Action required"
                    : `${Math.max(0, 100 - data.burnRate)}% margin left`}
                </span>
                <span style={{ color: "var(--accent-cyan)" }}>Real-time</span>
              </div>
            </div>
          </div>

          {/* 4. Main 2-Column Section */}
          <div className="dashboard-main-layout">
            {/* Column Left: Active Budgets & Recent Expenses */}
            <div className="dashboard-column-left">
              {/* Section: Active Budgets */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    <Layers size={20} />
                    <span>Category Budgets</span>
                    <span className="badge-status status-active">
                      {data.budgets?.length || 0}
                    </span>
                  </div>
                  <Link to="/budget" className="dashboard-card-action">
                    <span>View All Budgets</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>

                {data.budgets?.length === 0 ? (
                  <div className="empty-state-card" style={{ padding: "2rem 1rem" }}>
                    <Wallet size={32} color="var(--accent-indigo)" />
                    <h3 style={{ fontSize: "1.1rem" }}>No Budgets Established Yet</h3>
                    <p style={{ fontSize: "0.875rem" }}>
                      Create category targets for groceries, rent, bills, or
                      entertainment to monitor your burn rate.
                    </p>
                    <Link
                      to="/create-budget"
                      className="btn-primary-action"
                      style={{ marginTop: "0.75rem" }}
                    >
                      <Plus size={16} />
                      <span>Create Your First Budget</span>
                    </Link>
                  </div>
                ) : (
                  <div className="dashboard-budgets-list">
                    {data.budgets.slice(0, 4).map((b) => {
                      const categoryName =
                        b.category?.category || b.category?.name || "General";
                      const monthName =
                        MONTH_NAMES[b.month] || `Month ${b.month}`;
                      const spent = Number(b.spent) || 0;
                      const limit = Number(b.amount) || 0;
                      const rem = limit - spent;
                      const percentage =
                        limit > 0 ? Math.round((spent / limit) * 100) : 0;

                      return (
                        <div
                          key={b._id}
                          className="dashboard-budget-row"
                          onClick={() => navigate(`/budget/${b._id}`)}
                        >
                          <div className="budget-row-top">
                            <div className="budget-row-category">
                              <div className="category-icon-box">
                                <Layers size={18} />
                              </div>
                              <div>
                                <span className="category-name-text">
                                  {categoryName}
                                </span>
                                <div className="budget-row-month">
                                  {monthName} {b.year}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`budget-remaining-pill ${
                                rem < 0
                                  ? "rem-over"
                                  : percentage >= 80
                                  ? "rem-warning"
                                  : "rem-safe"
                              }`}
                            >
                              {rem < 0
                                ? `Over by ₹${Math.abs(rem).toLocaleString()}`
                                : `₹${rem.toLocaleString()} left`}
                            </span>
                          </div>

                          <div className="budget-row-metrics">
                            <div className="budget-spent-ratio">
                              <span className="ratio-label">Spent / Target</span>
                              <div className="ratio-numbers">
                                <span className="spent-highlight">
                                  ₹{spent.toLocaleString()}
                                </span>{" "}
                                <span className="limit-text">
                                  / ₹{limit.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color:
                                  percentage > 100
                                    ? "#ef4444"
                                    : percentage >= 80
                                    ? "#f59e0b"
                                    : "var(--accent-cyan)",
                              }}
                            >
                              {percentage}%
                            </span>
                          </div>

                          <div className="progress-bar-track">
                            <div
                              className={`progress-bar-fill ${
                                percentage > 100
                                  ? "fill-danger"
                                  : percentage >= 80
                                  ? "fill-warning"
                                  : "fill-safe"
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section: Recent Purchases */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    <ShoppingBag size={20} />
                    <span>Recent Transactions</span>
                    <span className="badge-status status-active">
                      {data.recentPurchases?.length || 0}
                    </span>
                  </div>
                  <button
                    onClick={handleOpenModal}
                    className="btn-inline-toggle"
                  >
                    <Plus size={14} />
                    <span>Log Expense</span>
                  </button>
                </div>

                {data.recentPurchases?.length === 0 ? (
                  <div className="empty-state-card" style={{ padding: "2rem 1rem" }}>
                    <ShoppingBag size={32} color="var(--accent-indigo)" />
                    <h3 style={{ fontSize: "1.1rem" }}>No Transactions Recorded</h3>
                    <p style={{ fontSize: "0.875rem" }}>
                      Tap "Log Expense" to log your first expenditure against an
                      active budget.
                    </p>
                    <button
                      onClick={handleOpenModal}
                      className="btn-primary-action"
                      style={{ marginTop: "0.75rem" }}
                    >
                      <Plus size={16} />
                      <span>Log First Expense</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="purchase-table">
                      <thead>
                        <tr>
                          <th>Item & Note</th>
                          <th>Category</th>
                          <th>Date</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentPurchases.map((purchase) => {
                          const catName =
                            purchase.category?.category ||
                            purchase.category?.name ||
                            "General";
                          const formattedDate = purchase.date
                            ? new Date(purchase.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "Recent";

                          return (
                            <tr
                              key={purchase._id}
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                const bId =
                                  purchase.budget?._id || purchase.budget;
                                if (bId) navigate(`/budget/${bId}`);
                              }}
                              title="Click to view associated budget"
                            >
                              <td>
                                <div className="purchase-item-title">
                                  <span>{purchase.title}</span>
                                </div>
                                {purchase.note && (
                                  <div className="purchase-item-note">
                                    {purchase.note}
                                  </div>
                                )}
                              </td>
                              <td>
                                <span className="category-chip">
                                  <Layers size={11} />
                                  {catName}
                                </span>
                              </td>
                              <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                {formattedDate}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <span className="purchase-amount-cell">
                                  - ₹{Number(purchase.amount || 0).toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Column Right: Breakdown, Smart Insights, Shortcuts */}
            <div className="dashboard-column-right">
              {/* Card 1: Category Spending Breakdown */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    <PieChart size={20} />
                    <span>Category Breakdown</span>
                  </div>
                </div>

                {data.categoryBreakdown?.length === 0 ? (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.875rem",
                      textAlign: "center",
                      padding: "1.5rem 0",
                    }}
                  >
                    No category expenditures recorded yet this period.
                  </p>
                ) : (
                  <div className="category-breakdown-list">
                    {data.categoryBreakdown.map((item, index) => {
                      const color =
                        CATEGORY_COLORS[index % CATEGORY_COLORS.length];

                      return (
                        <div key={item.category} className="category-item-row">
                          <div className="category-item-header">
                            <div className="category-item-label">
                              <span
                                className="category-dot"
                                style={{
                                  backgroundColor: color,
                                  boxShadow: `0 0 8px ${color}`,
                                }}
                              ></span>
                              <span>{item.category}</span>
                            </div>
                            <div className="category-item-amount">
                              <span>₹{Number(item.amount).toLocaleString()}</span>
                              <span className="category-item-percent">
                                ({item.percentage}%)
                              </span>
                            </div>
                          </div>

                          <div className="mini-progress-bar">
                            <div
                              className="mini-progress-fill"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: color,
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card 2: Financial Health & Smart Insights */}
              <div className="dashboard-card insights-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    <Sparkles size={20} color="var(--accent-cyan)" />
                    <span>Financial Insights</span>
                  </div>
                  <span className="dashboard-stat-pill pill-indigo">AI Pulse</span>
                </div>

                <div>
                  {/* Dynamic Insight 1 */}
                  <div className="insight-item">
                    <div
                      className="insight-icon"
                      style={{
                        background:
                          data.burnRate >= 85
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(16, 185, 129, 0.15)",
                        color: data.burnRate >= 85 ? "#f87171" : "#34d399",
                      }}
                    >
                      {data.burnRate >= 85 ? (
                        <AlertTriangle size={17} />
                      ) : (
                        <ShieldCheck size={17} />
                      )}
                    </div>
                    <div className="insight-body">
                      <div className="insight-title">
                        {data.burnRate > 100
                          ? "Budget Limit Exceeded"
                          : data.burnRate >= 85
                          ? "High Spend Velocity"
                          : "Optimal Discipline"}
                      </div>
                      <div className="insight-text">
                        {data.burnRate > 100
                          ? "Your aggregate spending has crossed your total budget allocation. Consider pausing non-essential purchases."
                          : data.burnRate >= 85
                          ? `You've utilized ${data.burnRate}% of your total budget. Keep spending conservative for the rest of the cycle.`
                          : `You have preserved ₹${Math.max(
                              0,
                              data.remaining
                            ).toLocaleString()} (${100 - data.burnRate}% remaining). Excellent spending discipline!`}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Insight 2: Highest Category */}
                  {topCategory && (
                    <div className="insight-item">
                      <div
                        className="insight-icon"
                        style={{
                          background: "rgba(99, 102, 241, 0.15)",
                          color: "var(--accent-indigo)",
                        }}
                      >
                        <TrendingUp size={17} />
                      </div>
                      <div className="insight-body">
                        <div className="insight-title">Largest Outflow Category</div>
                        <div className="insight-text">
                          <strong style={{ color: "#ffffff" }}>
                            {topCategory.category}
                          </strong>{" "}
                          represents <strong>{topCategory.percentage}%</strong> of
                          your total monthly spending (₹
                          {Number(topCategory.amount).toLocaleString()}).
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Insight 3: Quick Tip */}
                  <div className="insight-item">
                    <div
                      className="insight-icon"
                      style={{
                        background: "rgba(6, 182, 212, 0.15)",
                        color: "var(--accent-cyan)",
                      }}
                    >
                      <Zap size={17} />
                    </div>
                    <div className="insight-body">
                      <div className="insight-title">Smart Recommendation</div>
                      <div className="insight-text">
                        Logging transactions on the same day prevents untracked cash
                        leaks and preserves up to 18% more monthly savings.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Quick Action Shortcuts */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    <Zap size={20} />
                    <span>Quick Shortcuts</span>
                  </div>
                </div>

                <div className="quick-shortcuts-grid">
                  <button onClick={handleOpenModal} className="shortcut-btn">
                    <Plus size={20} />
                    <span>Log Expense</span>
                  </button>

                  <Link to="/create-budget" className="shortcut-btn">
                    <Layers size={20} />
                    <span>New Budget</span>
                  </Link>

                  <Link to="/budget" className="shortcut-btn">
                    <Wallet size={20} />
                    <span>All Budgets</span>
                  </Link>

                  <button
                    onClick={() => fetchDashboard(true)}
                    className="shortcut-btn"
                  >
                    <RefreshCw size={20} />
                    <span>Sync Stats</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 5. Quick Add Expense Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="modal-content-card">
            <div className="modal-header-bar">
              <h3>
                <ShoppingBag size={22} color="var(--accent-indigo)" />
                <span>Quick Log Expense</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-close-modal"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div
                className="status-banner banner-error"
                style={{ marginBottom: "1rem" }}
              >
                <AlertTriangle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div
                className="status-banner banner-success"
                style={{ marginBottom: "1rem" }}
              >
                <CheckCircle2 size={16} />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit}>
              {/* Select Budget */}
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Target Budget Category</label>
                <div className="input-wrapper">
                  <Layers className="input-icon" size={18} />
                  <select
                    className="form-select"
                    value={modalForm.budgetId}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, budgetId: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select active budget...
                    </option>
                    {data.budgets?.map((b) => {
                      const catName =
                        b.category?.category || b.category?.name || "General";
                      const rem = (Number(b.amount) || 0) - (Number(b.spent) || 0);
                      return (
                        <option key={b._id} value={b._id}>
                          {catName} (₹{rem.toLocaleString()} remaining)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Expense Title / Description</label>
                <div className="input-wrapper">
                  <ShoppingBag className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Grocery Haul, Uber ride, Dinner"
                    value={modalForm.title}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, title: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Amount & Date in 2 columns */}
              <div className="form-row-2col" style={{ marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <div className="input-wrapper">
                    <IndianRupee className="input-icon" size={18} />
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0.00"
                      min="1"
                      step="any"
                      value={modalForm.amount}
                      onChange={(e) =>
                        setModalForm({ ...modalForm, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <div className="input-wrapper">
                    <Calendar className="input-icon" size={18} />
                    <input
                      type="date"
                      className="form-input"
                      value={modalForm.date}
                      onChange={(e) =>
                        setModalForm({ ...modalForm, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Optional Note</label>
                <div className="input-wrapper">
                  <CreditCard className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Store name, receipt notes, payment mode..."
                    value={modalForm.note}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, note: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary-action"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Record Expense</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dahsboard;
