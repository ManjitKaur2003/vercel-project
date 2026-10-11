import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../ApiClient/interceptor";
import {
  ArrowLeft,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  IndianRupee,
  User,
  Plus,
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  Trash2,
  X,
  Check,
  AlertTriangle,
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

const BudgetDetails = () => {
  const { budgetId } = useParams();

  // Budget states
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Purchases states
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    title: "",
    amount: "",
    note: "",
  });
  const [purchaseSubmitting, setPurchaseSubmitting] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState({ type: "", text: "" });

  const getBudgetDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get(`/budget/get/${budgetId}`);
      setBudget(response.data.budget);
    } catch (err) {
      console.log(err.message);
      setError(
        err.response?.data?.message || "Failed to load budget details."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPurchases = async () => {
    try {
      setPurchasesLoading(true);
      const response = await apiClient.get(`/purchase/get/${budgetId}`);
      setPurchases(response.data.purchases || []);
    } catch (err) {
      console.log(err.message);
    } finally {
      setPurchasesLoading(false);
    }
  };

  useEffect(() => {
    if (budgetId) {
      getBudgetDetails();
      getPurchases();
    }
  }, [budgetId]);

  const handlePurchaseChange = (e) => {
    setPurchaseForm({
      ...purchaseForm,
      [e.target.name]: e.target.value,
    });
    if (purchaseMessage.text) {
      setPurchaseMessage({ type: "", text: "" });
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!purchaseForm.title.trim() || !purchaseForm.amount) {
      setPurchaseMessage({
        type: "error",
        text: "Please provide both item name and amount.",
      });
      return;
    }

    try {
      setPurchaseSubmitting(true);
      await apiClient.post("/purchase/create", {
        ...purchaseForm,
        budgetId,
      });

      setPurchaseMessage({
        type: "success",
        text: "Purchase recorded successfully!",
      });

      setPurchaseForm({ title: "", amount: "", note: "" });
      setShowAddPurchase(false);
      // Refresh purchases
      await getPurchases();
    } catch (err) {
      console.log(err.message);
      setPurchaseMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to record purchase.",
      });
    } finally {
      setPurchaseSubmitting(false);
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (!window.confirm("Are you sure you want to delete this purchase?")) return;

    try {
      await apiClient.delete(`/purchase/delete/${purchaseId}`);
      // Refresh purchases
      getPurchases();
    } catch (err) {
      console.log(err.message);
    }
  };

  // Calculations
  const totalLimit = budget ? Number(budget.amount) || 0 : 0;
  const totalSpent = purchases.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0
  );
  const remaining = totalLimit - totalSpent;
  const percentUsed = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const clampedPercent = Math.min(Math.round(percentUsed), 100);

  // Status color helpers
  const getProgressClass = () => {
    if (percentUsed > 100) return "fill-danger";
    if (percentUsed >= 80) return "fill-warning";
    return "fill-safe";
  };

  const monthName = budget ? MONTH_NAMES[budget.month] || `Month ${budget.month}` : "";
  const categoryName =
    budget?.category?.category || budget?.category?.name || "General";

  return (
    <div className="budget-details-container">
      {/* Back to Budgets breadcrumb */}
      <Link to="/budget" className="back-nav-link">
        <ArrowLeft size={16} />
        <span>Back to All Budgets</span>
      </Link>

      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching budget details...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="create-budget-card" style={{ textAlign: "center", margin: "0 auto" }}>
          <div className="alert alert-error" style={{ justifyContent: "center" }}>
            <AlertCircle className="alert-icon" />
            <span>{error}</span>
          </div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            The requested budget could not be found or you don't have access to view it.
          </p>
          <Link to="/budget" className="btn-primary-action">
            <ArrowLeft size={16} />
            <span>Return to Budgets</span>
          </Link>
        </div>
      )}

      {/* Budget details content */}
      {!loading && !error && budget && (
        <>
          {/* Main Hero Card */}
          <div className="budget-details-hero">
            <div className="details-hero-top">
              <div className="details-title-group">
                <span className="category-chip" style={{ marginBottom: "0.5rem" }}>
                  <Layers size={14} />
                  {categoryName}
                </span>
                <h1>{categoryName} Budget</h1>
                <p>
                  Target allocation for {monthName} {budget.year}
                </p>
              </div>

              <span
                className={`badge-status ${
                  remaining < 0
                    ? "status-done"
                    : budget.isDone
                    ? "status-done"
                    : "status-active"
                }`}
                style={{
                  fontSize: "0.875rem",
                  padding: "0.4rem 0.85rem",
                  backgroundColor: remaining < 0 ? "rgba(239, 68, 68, 0.15)" : undefined,
                  color: remaining < 0 ? "#fca5a5" : undefined,
                  border: remaining < 0 ? "1px solid rgba(239, 68, 68, 0.3)" : undefined,
                }}
              >
                {remaining < 0 ? (
                  <>
                    <AlertTriangle size={15} /> Budget Exceeded
                  </>
                ) : budget.isDone ? (
                  <>
                    <CheckCircle2 size={15} /> Completed Target
                  </>
                ) : (
                  <>
                    <Clock size={15} /> Active Budget
                  </>
                )}
              </span>
            </div>

            {/* Large Amount Banner */}
            <div className="details-amount-banner">
              <div className="amount-box">
                <p>Allocated Limit</p>
                <h2>
                  <span className="currency">₹</span>
                  {totalLimit.toLocaleString()}
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--accent-emerald)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  background: "var(--success-bg)",
                  padding: "0.5rem 1rem",
                  borderRadius: "10px",
                }}
              >
                <TrendingUp size={16} />
                <span>Monthly Limit</span>
              </div>
            </div>
          </div>

          {/* Key Metadata Breakdown */}
          <div className="details-grid-meta">
            <div className="details-meta-card">
              <div className="meta-icon-box">
                <Layers size={20} />
              </div>
              <div className="meta-content">
                <span className="meta-label">Category</span>
                <span className="meta-value">{categoryName}</span>
              </div>
            </div>

            <div className="details-meta-card">
              <div className="meta-icon-box">
                <Calendar size={20} />
              </div>
              <div className="meta-content">
                <span className="meta-label">Period</span>
                <span className="meta-value">
                  {monthName} {budget.year}
                </span>
              </div>
            </div>

            <div className="details-meta-card">
              <div className="meta-icon-box">
                <IndianRupee size={20} />
              </div>
              <div className="meta-content">
                <span className="meta-label">Total Cap</span>
                <span className="meta-value">₹{totalLimit.toLocaleString()}</span>
              </div>
            </div>

            <div className="details-meta-card">
              <div className="meta-icon-box">
                <User size={20} />
              </div>
              <div className="meta-content">
                <span className="meta-label">Created By</span>
                <span className="meta-value">
                  {budget.user?.userName || budget.user?.email || "Account Holder"}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* PURCHASES & SPENDING SECTION                               */}
          {/* ========================================================== */}
          <div className="purchase-section-wrapper">
            {/* Spending Progress & Calculation Card */}
            <div className="progress-card">
              <div className="progress-header-metrics">
                <div className="metric-pill">
                  <span className="metric-pill-label">Total Budget</span>
                  <span className="metric-pill-value">₹{totalLimit.toLocaleString()}</span>
                </div>

                <div className="metric-pill">
                  <span className="metric-pill-label">Total Spent</span>
                  <span className="metric-pill-value spent">
                    ₹{totalSpent.toLocaleString()}
                  </span>
                </div>

                <div className="metric-pill">
                  <span className="metric-pill-label">
                    {remaining >= 0 ? "Remaining Balance" : "Over Budget"}
                  </span>
                  <span
                    className={`metric-pill-value ${
                      remaining >= 0 ? "remaining" : "overbudget"
                    }`}
                  >
                    {remaining < 0 ? "-" : ""}₹{Math.abs(remaining).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="progress-bar-container">
                <div
                  className={`progress-bar-fill ${getProgressClass()}`}
                  style={{ width: `${clampedPercent}%` }}
                ></div>
              </div>

              <div className="progress-footer-note">
                <span>{percentUsed.toFixed(1)}% of budget utilized</span>
                <span>
                  {remaining >= 0
                    ? `₹${remaining.toLocaleString()} left to spend`
                    : `Exceeded by ₹${Math.abs(remaining).toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Action Bar / Header for Purchases */}
            <div className="purchase-header-row">
              <div className="purchase-header-info">
                <h2>
                  <ShoppingBag size={20} color="var(--accent-cyan)" />
                  Purchases & Expenses
                </h2>
                <p>Track all transactions allocated against this budget.</p>
              </div>

              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setShowAddPurchase(!showAddPurchase)}
              >
                {showAddPurchase ? (
                  <>
                    <X size={16} />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Record Purchase</span>
                  </>
                )}
              </button>
            </div>

            {/* Notification alert for purchase actions */}
            {purchaseMessage.text && (
              <div
                className={`alert ${
                  purchaseMessage.type === "success"
                    ? "alert-success"
                    : "alert-error"
                }`}
              >
                {purchaseMessage.type === "success" ? (
                  <CheckCircle2 className="alert-icon" />
                ) : (
                  <AlertCircle className="alert-icon" />
                )}
                <span>{purchaseMessage.text}</span>
              </div>
            )}

            {/* Add Purchase Form */}
            {showAddPurchase && (
              <div className="add-purchase-card">
                <h3>
                  <Plus size={18} color="var(--accent-indigo)" />
                  New Purchase Entry
                </h3>
                <form onSubmit={handlePurchaseSubmit}>
                  <div className="purchase-form-grid">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="purchase-title">
                        Item / Description
                      </label>
                      <input
                        id="purchase-title"
                        type="text"
                        name="title"
                        className="form-input"
                        style={{ paddingLeft: "1rem" }}
                        placeholder="e.g. Shirt, Grocery bag, Dinner"
                        value={purchaseForm.title}
                        onChange={handlePurchaseChange}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="purchase-amount">
                        Amount (₹)
                      </label>
                      <input
                        id="purchase-amount"
                        type="number"
                        step="any"
                        min="1"
                        name="amount"
                        className="form-input"
                        style={{ paddingLeft: "1rem" }}
                        placeholder="e.g. 900"
                        value={purchaseForm.amount}
                        onChange={handlePurchaseChange}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="purchase-note">
                        Note (Optional)
                      </label>
                      <input
                        id="purchase-note"
                        type="text"
                        name="note"
                        className="form-input"
                        style={{ paddingLeft: "1rem" }}
                        placeholder="e.g. Cotton shirt from Zara"
                        value={purchaseForm.note}
                        onChange={handlePurchaseChange}
                      />
                    </div>
                  </div>

                  <div className="purchase-actions-row">
                    <button
                      type="button"
                      className="btn-secondary-action"
                      onClick={() => setShowAddPurchase(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary-action"
                      disabled={purchaseSubmitting}
                    >
                      {purchaseSubmitting ? (
                        <>
                          <div className="spinner"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Save Purchase</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Purchases List */}
            <div className="purchases-list-card">
              {purchasesLoading ? (
                <div className="loading-container" style={{ padding: "3rem 1rem" }}>
                  <div className="spinner"></div>
                  <p>Loading purchases...</p>
                </div>
              ) : purchases.length === 0 ? (
                <div className="empty-purchases-box">
                  <ShoppingBag size={42} color="var(--text-muted)" />
                  <p>No purchases recorded for this budget yet.</p>
                  <button
                    type="button"
                    className="btn-secondary-action"
                    onClick={() => setShowAddPurchase(true)}
                  >
                    <Plus size={15} />
                    <span>Record your first purchase</span>
                  </button>
                </div>
              ) : (
                <table className="purchase-table">
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((item) => {
                      const itemDate = item.date
                        ? new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A";

                      return (
                        <tr key={item._id}>
                          <td>
                            <div className="purchase-item-title">
                              <ShoppingBag size={15} color="var(--accent-indigo)" />
                              <span>{item.title}</span>
                            </div>
                            {item.note && (
                              <div className="purchase-item-note">
                                {item.note}
                              </div>
                            )}
                          </td>
                          <td style={{ color: "var(--text-secondary)" }}>
                            {itemDate}
                          </td>
                          <td className="purchase-amount-cell">
                            ₹{Number(item.amount).toLocaleString()}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className="btn-delete-icon"
                              title="Delete purchase"
                              onClick={() => handleDeletePurchase(item._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetDetails;
