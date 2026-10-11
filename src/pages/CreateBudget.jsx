import React, { useEffect, useState, useRef } from "react";
import apiClient from "../ApiClient/interceptor";
import {
  Layers,
  Plus,
  X,
  Check,
  IndianRupee,
  Calendar,
  CalendarDays,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const CreateBudget = () => {
  const [categories, setCategories] = useState([]);
  const [categoryLoader, setcateoryLoader] = useState(true);
  const [createCategory, setCreateCategory] = useState(false);
  const [createCategoryData, setcreateCategoryData] = useState({
    category: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState(null);
  const dropdownRef = useRef(null);

  //  create budget:
  const [budgetData, setBudgetData] = useState({
    category: "",
    amount: "",
    month: "",
    year: new Date().getFullYear().toString(),
  });

  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getHiddenCategories = () => {
    try {
      return JSON.parse(localStorage.getItem("hidden_categories") || "[]");
    } catch {
      return [];
    }
  };

  const addHiddenCategory = (id) => {
    try {
      const current = getHiddenCategories();
      if (!current.includes(id)) {
        localStorage.setItem("hidden_categories", JSON.stringify([...current, id]));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryName = (cat) => {
    if (!cat) return "";
    return cat.category || cat.categoryName || "Unnamed Category";
  };

  const getCategories = async () => {
    try {
      const response = await apiClient.get("/category/get");
      const list = response.data.data || [];
      const hiddenIds = getHiddenCategories();
      const visibleList = list.filter((cat) => !hiddenIds.includes(cat._id));
      setCategories(visibleList);
      // If categories exist and budgetData has no category yet, preselect the first category
      if (visibleList.length > 0 && !budgetData.category) {
        setBudgetData((prev) => ({
          ...prev,
          category: prev.category || visibleList[0]._id,
        }));
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setcateoryLoader(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryChange = (e) => {
    setcreateCategoryData({
      ...createCategoryData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!createCategoryData.category.trim()) return;

    try {
      await apiClient.post("/category/create", createCategoryData);
      await getCategories();
      setcreateCategoryData({
        category: "",
      });
      setCreateCategory(false);
      setStatusMessage({
        type: "success",
        text: "New category created successfully!",
      });
    } catch (err) {
      console.log(err.message);
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create category",
      });
    }
  };

  const deleteCategoryApi = async (categoryId) => {
    const attempts = [
      { method: "delete", url: `/category/delete/${categoryId}` },
      { method: "delete", url: `/category/${categoryId}` },
      { method: "delete", url: `/category/remove/${categoryId}` },
      { method: "post", url: `/category/delete/${categoryId}` },
      { method: "post", url: `/category/delete`, data: { id: categoryId, categoryId } },
      { method: "delete", url: `/category/delete`, data: { id: categoryId, categoryId } },
      { method: "delete", url: `/category`, params: { id: categoryId, categoryId } },
      { method: "delete", url: `/category/delete`, params: { id: categoryId, categoryId } },
      { method: "post", url: `/category/remove`, data: { id: categoryId, categoryId } },
    ];

    let lastErr = null;
    const errors = [];
    for (const attempt of attempts) {
      try {
        const res = await apiClient({
          method: attempt.method,
          url: attempt.url,
          data: attempt.data,
          params: attempt.params,
        });
        console.log(`[deleteCategoryApi] Succeeded with:`, attempt, res.data);
        return res;
      } catch (err) {
        lastErr = err;
        errors.push({
          method: attempt.method,
          url: attempt.url,
          status: err.response?.status,
          message: err.response?.data?.message || err.response?.statusText || err.message,
        });
        // If it's NOT a 404 (e.g. 400, 401, 403, 500), the route exists on backend but failed
        if (err.response && err.response.status !== 404) {
          throw err;
        }
      }
    }

    console.error("[deleteCategoryApi] All backend route attempts failed with 404:", errors);
    const notFoundError = new Error(
      "Backend route not found (404). Your backend does not have a category delete endpoint configured."
    );
    notFoundError.is404 = true;
    notFoundError.details = errors;
    throw notFoundError;
  };

  const handleDeleteCategory = async (categoryId, categoryName, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const name = categoryName || "this category";
    const confirmed = window.confirm(
      `Are you sure you want to remove the category "${name}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingCatId(categoryId);
      await deleteCategoryApi(categoryId);

      // Successfully deleted from backend
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));

      if (budgetData.category === categoryId) {
        const remaining = categories.filter((c) => c._id !== categoryId);
        setBudgetData((prev) => ({
          ...prev,
          category: remaining.length > 0 ? remaining[0]._id : "",
        }));
      }

      setStatusMessage({
        type: "success",
        text: `Category "${name}" deleted permanently from database!`,
      });
    } catch (err) {
      console.error("Delete category error:", err);

      // If backend route does not exist (404)
      if (err.is404) {
        const removeLocal = window.confirm(
          `Your backend server does not have a DELETE route implemented for categories (HTTP 404).\n\nWould you like to remove "${name}" from this list on your screen anyway?`
        );
        if (removeLocal) {
          addHiddenCategory(categoryId);
          setCategories((prev) => prev.filter((c) => c._id !== categoryId));
          if (budgetData.category === categoryId) {
            const remaining = categories.filter((c) => c._id !== categoryId);
            setBudgetData((prev) => ({
              ...prev,
              category: remaining.length > 0 ? remaining[0]._id : "",
            }));
          }
          setStatusMessage({
            type: "success",
            text: `Category "${name}" removed from view! (To delete permanently from DB, add the DELETE /api/category/delete/:id route in your backend)`,
          });
          return;
        }
      }

      const serverMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : "") ||
        err.message;

      setStatusMessage({
        type: "error",
        text: `Failed to remove category "${name}": ${serverMsg}`,
      });
    } finally {
      setDeletingCatId(null);
    }
  };

  const month = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  const handleChange = (e) => {
    setBudgetData({
      ...budgetData,
      [e.target.name]: e.target.value,
    });
    if (statusMessage.text) {
      setStatusMessage({ type: "", text: "" });
    }
  };

  const createBudget = async (dataToSubmit) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.post("/budget/create", dataToSubmit);
      console.log(response, "test");
      setStatusMessage({
        type: "success",
        text: "Budget created successfully!",
      });
      setBudgetData({
        category: categories.length > 0 ? categories[0]._id : "",
        amount: "",
        month: "",
        year: new Date().getFullYear().toString(),
      });
    } catch (err) {
      console.log(err.message);
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create budget",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitBudget = (e) => {
    e.preventDefault();
    if (!budgetData.category) {
      setStatusMessage({ type: "error", text: "Please select a category." });
      return;
    }
    if (!budgetData.amount || Number(budgetData.amount) <= 0) {
      setStatusMessage({ type: "error", text: "Please enter a valid amount." });
      return;
    }
    if (!budgetData.month) {
      setStatusMessage({ type: "error", text: "Please select a month." });
      return;
    }
    if (!budgetData.year) {
      setStatusMessage({ type: "error", text: "Please specify a year." });
      return;
    }

    createBudget(budgetData);
  };

  const selectedCategory = categories.find((cat) => cat._id === budgetData.category);

  return (
    <div className="create-budget-wrapper">
      <div className="create-budget-card">
        <div className="auth-header" style={{ marginBottom: "1.75rem" }}>
          <h1>Create Budget</h1>
          <p>Define spending limits per category to stay financially on track.</p>
        </div>

        {statusMessage.text && (
          <div
            className={`alert ${
              statusMessage.type === "success" ? "alert-success" : "alert-error"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="alert-icon" />
            ) : (
              <AlertCircle className="alert-icon" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={submitBudget}>
          {/* Category Selection */}
          <div className="form-group">
            <div className="category-header-bar">
              <label className="form-label" htmlFor="budget-category">
                Category
              </label>
              <button
                type="button"
                className="btn-inline-toggle"
                onClick={() => setCreateCategory(!createCategory)}
              >
                {createCategory ? (
                  <>
                    <X size={14} /> Close
                  </>
                ) : (
                  <>
                    <Plus size={14} /> New Category
                  </>
                )}
              </button>
            </div>

            {/* Custom Category Dropdown with Remove Buttons */}
            <div className="custom-category-select-wrapper" ref={dropdownRef}>
              <div
                id="budget-category"
                className={`custom-category-trigger ${isDropdownOpen ? "active" : ""}`}
                onClick={() => {
                  if (!categoryLoader && categories.length > 0) {
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!categoryLoader && categories.length > 0) {
                      setIsDropdownOpen(!isDropdownOpen);
                    }
                  }
                }}
              >
                <Layers className="input-icon" />

                <span
                  className={`custom-category-trigger-text ${
                    !selectedCategory ? "placeholder" : ""
                  }`}
                >
                  {categoryLoader
                    ? "Loading categories..."
                    : categories.length === 0
                    ? "No categories found. Create one first!"
                    : selectedCategory
                    ? getCategoryName(selectedCategory)
                    : "Select a category"}
                </span>

                <div className="custom-category-trigger-actions">
                  {/* Quick Delete button for currently selected category */}
                  {selectedCategory && (
                    <button
                      type="button"
                      className="btn-trigger-delete"
                      title={`Remove category "${getCategoryName(selectedCategory)}"`}
                      disabled={deletingCatId === selectedCategory._id}
                      onClick={(e) =>
                        handleDeleteCategory(
                          selectedCategory._id,
                          getCategoryName(selectedCategory),
                          e
                        )
                      }
                    >
                      {deletingCatId === selectedCategory._id ? (
                        <span className="mini-spinner-danger" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  )}

                  {!categoryLoader && categories.length > 0 && (
                    <span style={{ color: "var(--text-muted)", display: "flex" }}>
                      {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  )}
                </div>
              </div>

              {/* Hidden input to store selected category for form */}
              <input
                type="hidden"
                name="category"
                value={budgetData.category}
                required
              />

              {/* Dropdown Menu with category list and remove buttons */}
              {isDropdownOpen && (
                <div className="category-dropdown-menu">
                  <div className="category-dropdown-header">
                    <span>Available Categories ({categories.length})</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      Click 🗑 to remove
                    </span>
                  </div>

                  <ul className="category-dropdown-list">
                    {categories.map((cat) => {
                      const isSelected = budgetData.category === cat._id;
                      const catName = getCategoryName(cat);
                      const isDeleting = deletingCatId === cat._id;

                      return (
                        <li
                          key={cat._id}
                          className={`category-dropdown-item ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => {
                            setBudgetData((prev) => ({
                              ...prev,
                              category: cat._id,
                            }));
                            setIsDropdownOpen(false);
                            if (statusMessage.text) {
                              setStatusMessage({ type: "", text: "" });
                            }
                          }}
                        >
                          <div className="category-item-main">
                            <Layers
                              size={14}
                              style={{
                                color: isSelected
                                  ? "var(--accent-cyan)"
                                  : "var(--text-muted)",
                              }}
                            />
                            <span className="category-item-name">{catName}</span>
                          </div>

                          <button
                            type="button"
                            className="category-delete-btn"
                            title={`Remove "${catName}"`}
                            disabled={isDeleting}
                            onClick={(e) => handleDeleteCategory(cat._id, catName, e)}
                          >
                            {isDeleting ? (
                              <span className="mini-spinner-danger" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="category-dropdown-footer">
                    <button
                      type="button"
                      className="btn-dropdown-add"
                      onClick={() => {
                        setCreateCategory(true);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Plus size={14} /> Add New Category
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Inline Create Category Form & Manage Chips */}
            {createCategory && (
              <div className="inline-category-box">
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  Create New Category:
                </span>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "1rem" }}
                  placeholder="e.g. Groceries, Entertainment, Rent"
                  onChange={handleCategoryChange}
                  name="category"
                  value={createCategoryData.category}
                />
                <div className="inline-category-actions">
                  <button
                    type="button"
                    className="btn-mini-cancel"
                    onClick={() => setCreateCategory(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-mini-save"
                    onClick={handleCategorySubmit}
                  >
                    <Check size={14} style={{ display: "inline", marginRight: "4px" }} />
                    Save Category
                  </button>
                </div>

                {/* Removable Category Badges inside the Manager */}
                {categories.length > 0 && (
                  <div className="category-chips-section">
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        display: "block",
                      }}
                    >
                      Existing Categories (Click 🗑 to remove):
                    </span>
                    <div className="category-chips-grid">
                      {categories.map((cat) => {
                        const name = getCategoryName(cat);
                        const isDeleting = deletingCatId === cat._id;
                        return (
                          <div key={cat._id} className="category-badge-removable">
                            <span>{name}</span>
                            <button
                              type="button"
                              className="category-badge-delete-btn"
                              title={`Delete "${name}"`}
                              disabled={isDeleting}
                              onClick={(e) => handleDeleteCategory(cat._id, name, e)}
                            >
                              {isDeleting ? (
                                <span className="mini-spinner-danger" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="budget-amount">
              Budget Amount
            </label>
            <div className="input-container">
              <IndianRupee className="input-icon" />
              <input
                id="budget-amount"
                type="number"
                step="any"
                min="1"
                className="form-input"
                value={budgetData.amount}
                placeholder="e.g. 5000"
                name="amount"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Month & Year in 2 Columns */}
          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label" htmlFor="budget-month">
                Month
              </label>
              <div className="input-container">
                <Calendar className="input-icon" />
                <select
                  id="budget-month"
                  className="form-select"
                  onChange={handleChange}
                  name="month"
                  value={budgetData.month}
                  required
                >
                  <option value="" disabled>
                    Select Month
                  </option>
                  {month.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="budget-year">
                Year
              </label>
              <div className="input-container">
                <CalendarDays className="input-icon" />
                <input
                  id="budget-year"
                  type="number"
                  className="form-input"
                  placeholder="YYYY"
                  min="2020"
                  max="2100"
                  onChange={handleChange}
                  value={budgetData.year}
                  name="year"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Creating Budget...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Create Budget</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBudget;
