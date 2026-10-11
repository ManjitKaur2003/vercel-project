import { useEffect, useState } from "react";
import apiClient from "../ApiClient/interceptor";
import { Link, useNavigate } from "react-router-dom";
import {
  Wallet,
  Plus,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Clock,
  IndianRupee,
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

const Budget = () => {
  const [budget, setBudget] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getBudget = async () => {
    try {
      setLoading(true);
      //  api call
      const response = await apiClient.get("/budget/get");
      setBudget(response.data.budget || []);
    } catch (err) {
      console.log(err.message);
      setBudget([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBudget();
  }, []);

  const handleClick = (budgetId) => {
    console.log(budgetId);
    navigate(`/budget/${budgetId}`);
  };

  // Calculate stats
  const totalAllocated = budget.reduce(
    (acc, item) => acc + (Number(item.amount) || 0),
    0
  );
  const activeCount = budget.filter((b) => !b.isDone).length;

  return (
    <div className="budget-page-container">
      {/* Header Bar */}
      <div className="page-header-row">
        <div className="page-header-info">
          <h1>Budget Overview</h1>
          <p>Review and manage all your category spending targets.</p>
        </div>
        <Link to="/create-budget" className="btn-primary-action">
          <Plus size={18} />
          <span>New Budget</span>
        </Link>
      </div>

      {/* Stats Summary Bar */}
      <div className="budget-stats-grid">
        <div className="budget-stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo">
            <IndianRupee size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-value">₹{totalAllocated.toLocaleString()}</span>
            <span className="stat-label">Total Allocated</span>
          </div>
        </div>

        <div className="budget-stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">
            <Layers size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{budget.length}</span>
            <span className="stat-label">Total Budgets</span>
          </div>
        </div>

        <div className="budget-stat-card">
          <div className="stat-icon-wrapper stat-icon-cyan">
            <Clock size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{activeCount}</span>
            <span className="stat-label">Active Budgets</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your budgets...</p>
        </div>
      ) : budget.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon-box">
            <Wallet size={36} />
          </div>
          <h3>No Budgets Created Yet</h3>
          <p>
            You haven't set up any budget targets. Create a budget for groceries,
            bills, or entertainment to track your financial discipline.
          </p>
          <Link to="/create-budget" className="btn-primary-action">
            <Plus size={18} />
            <span>Create Your First Budget</span>
          </Link>
        </div>
      ) : (
        <div className="budget-grid">
          {budget.map((bud) => {
            const monthName = MONTH_NAMES[bud.month] || `Month ${bud.month}`;
            const categoryName =
              bud.category?.category || bud.category?.name || "Uncategorized";

            return (
              <div
                className="budget-card"
                key={bud._id}
                onClick={() => handleClick(bud._id)}
              >
                <div className="budget-card-top">
                  <span className="category-chip">
                    <Layers size={13} />
                    {categoryName}
                  </span>
                  <span className="period-chip">
                    <Calendar size={13} />
                    {monthName} {bud.year}
                  </span>
                </div>

                <div className="budget-card-amount">
                  <span className="amount-label">Allocated Limit</span>
                  <div className="amount-value">
                    <span className="currency-symbol">₹</span>
                    {Number(bud.amount).toLocaleString()}
                  </div>
                </div>

                <div className="budget-card-footer">
                  <span
                    className={`badge-status ${
                      bud.isDone ? "status-done" : "status-active"
                    }`}
                  >
                    {bud.isDone ? (
                      <>
                        <CheckCircle size={13} /> Completed
                      </>
                    ) : (
                      <>
                        <Clock size={13} /> Active
                      </>
                    )}
                  </span>

                  <span className="view-details-cta">
                    View Details <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Budget;
