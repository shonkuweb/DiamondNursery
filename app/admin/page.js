"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  FiUpload, 
  FiTrash2, 
  FiPlus, 
  FiTag, 
  FiEdit2, 
  FiSearch, 
  FiRefreshCw, 
  FiPackage, 
  FiLayers, 
  FiExternalLink, 
  FiImage, 
  FiCheckCircle, 
  FiX,
  FiTrendingUp,
  FiLock,
  FiKey,
  FiLogOut,
  FiEye,
  FiEyeOff,
  FiShield
} from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import Link from "next/link";
import imageCompression from 'browser-image-compression';

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Password reset state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCurrentPassword, setResetCurrentPassword] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Data state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
  const [previewUrl, setPreviewUrl] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState("inventory"); // "inventory" | "form" | "categories"
  
  // Edit mode state
  const [editingProductId, setEditingProductId] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  
  // New product form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [file, setFile] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  
  // Adenium options state
  const [adeniumPrice8, setAdeniumPrice8] = useState("");
  const [adeniumPrice10, setAdeniumPrice10] = useState("");
  const [adeniumPriceSingle, setAdeniumPriceSingle] = useState("");

  // New category form state
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("admin_token");
      if (token) {
        setIsAuthenticated(true);
        fetchData();
      }
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories")
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData || []);
      setCategories(catData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginPassword) return;
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Login failed");
      }
      sessionStorage.setItem("admin_token", data.token);
      setIsAuthenticated(true);
      setLoginPassword("");
      fetchData();
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetCurrentPassword || !resetNewPassword) return;
    setIsResetting(true);
    setResetError("");
    setResetSuccess("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: resetCurrentPassword, newPassword: resetNewPassword })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Password reset failed");
      }
      setResetSuccess("Password updated successfully!");
      setResetCurrentPassword("");
      setResetNewPassword("");
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess("");
      }, 1800);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const clearImage = () => {
    setFile(null);
    setPreviewUrl("");
    setExistingImage("");
  };

  const handleDeleteProduct = async (productSlug) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`/api/products?slug=${productSlug}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (catSlug) => {
    if (!confirm("Delete category? Associated products will lose their category classification.")) return;
    try {
      await fetch(`/api/categories?slug=${catSlug}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName || !categorySlug) return;
    setIsAddingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName, slug: categorySlug }),
      });
      if (!res.ok) throw new Error("Failed to add category");
      setCategoryName("");
      setCategorySlug("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setTitle(product.title);
    setSlug(product.slug);
    setPrice(product.price);
    setOldPrice(product.oldPrice || "");
    setExistingImage(product.image);
    setPreviewUrl(product.image || "");
    setCategoryId(product.categoryId ? product.categoryId.toString() : "");
    setDescription(product.description || "");
    setFile(null);

    if (product.adeniumOptions) {
      setAdeniumPrice8(product.adeniumOptions["Multigrafted 8\" Pot"] || "");
      setAdeniumPrice10(product.adeniumOptions["Multigrafted 10\" Pot"] || "");
      setAdeniumPriceSingle(product.adeniumOptions["Single Grafted"] || "");
    } else {
      setAdeniumPrice8("");
      setAdeniumPrice10("");
      setAdeniumPriceSingle("");
    }
    
    setActiveMobileTab("form");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setTitle("");
    setSlug("");
    setPrice("");
    setOldPrice("");
    setExistingImage("");
    setPreviewUrl("");
    setFile(null);
    setCategoryId("");
    setDescription("");
    setAdeniumPrice8("");
    setAdeniumPrice10("");
    setAdeniumPriceSingle("");
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!title || !slug || !price) {
      alert("Title, Slug, and Price are required!");
      return;
    }
    if (!editingProductId && !file && !existingImage) {
      alert("Please upload a product image!");
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = existingImage;

      if (file) {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options);
        
        const formData = new FormData();
        formData.append("file", new File([compressedFile], file.name, { type: compressedFile.type }));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Failed to upload image");
        }

        imageUrl = uploadData.url;
      }

      const selectedCategoryObj = categories.find(c => c.id == categoryId);
      const isAdenium = selectedCategoryObj?.name === "Adenium";
      const adeniumOptions = isAdenium ? {
        "Multigrafted 8\" Pot": adeniumPrice8 || null,
        "Multigrafted 10\" Pot": adeniumPrice10 || null,
        "Single Grafted": adeniumPriceSingle || null
      } : undefined;

      const productData = {
        slug,
        title,
        price,
        oldPrice: oldPrice || undefined,
        description: description || undefined,
        image: imageUrl,
        categoryId: categoryId ? parseInt(categoryId) : null,
        rating: 5.0,
        reviews: 120,
        adeniumOptions
      };

      let res;
      if (editingProductId) {
        productData.id = editingProductId;
        res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      if (!res.ok) {
        throw new Error(`Failed to ${editingProductId ? 'update' : 'save'} product`);
      }

      handleCancelEdit();
      fetchData();
      setActiveMobileTab("inventory");

    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!editingProductId) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleCategoryNameChange = (e) => {
    const newName = e.target.value;
    setCategoryName(newName);
    setCategorySlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.slug || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedFilterCategory === "all" || 
                              (p.categoryId && p.categoryId.toString() === selectedFilterCategory);
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedFilterCategory]);

  // Discount Calculation Helper
  const numPrice = parseFloat(price);
  const numOldPrice = parseFloat(oldPrice);
  const discountPercent = (numPrice && numOldPrice && numOldPrice > numPrice) 
    ? Math.round(((numOldPrice - numPrice) / numOldPrice) * 100) 
    : 0;

  // Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="login-card-pretty">
          <div className="login-brand">
            <div className="login-logo-icon">
              <FiShield />
            </div>
            <h2>Diamond Nursery</h2>
            <div className="login-lock-badge">
              <FiLock /> Admin Portal Security
            </div>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {loginError && (
              <div className="login-error-alert">
                <FiLock /> {loginError}
              </div>
            )}

            <div className="form-group-pretty">
              <label>Enter Admin Password</label>
              <div className="password-input-wrap">
                <FiLock className="input-left-icon" />
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  autoFocus
                />
                <button 
                  type="button" 
                  className="toggle-eye-btn" 
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showLoginPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit-glow full-width" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <FiRefreshCw className="spin" /> Verifying...
                </>
              ) : (
                <>
                  <FiLock /> Unlock Admin Portal
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <Link href="/" className="return-store-link">
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal">
      {/* Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand">
            <div className="admin-logo-icon">
              <FaLeaf />
            </div>
            <div>
              <h1 className="admin-title">Diamond Nursery</h1>
              <p className="admin-subtitle">Management Control Center</p>
            </div>
            <span className="admin-live-badge">
              <span className="admin-live-dot" /> Live
            </span>
          </div>

          <div className="admin-top-actions">
            <button className="admin-btn-secondary" onClick={() => setShowResetModal(true)} title="Reset Password">
              <FiKey /> Reset Password
            </button>
            <button className="admin-btn-secondary" onClick={fetchData} title="Refresh Store Data">
              <FiRefreshCw className={isLoading ? "spin" : ""} /> Refresh
            </button>
            <Link href="/" className="admin-btn-primary" target="_blank">
              <FiExternalLink /> View Store
            </Link>
            <button className="admin-btn-logout" onClick={handleLogout} title="Logout">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="admin-modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3><FiKey /> Reset Admin Password</h3>
              <button className="modal-close-btn" onClick={() => setShowResetModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handlePasswordReset} className="admin-pretty-form">
              {resetError && <div className="login-error-alert"><FiLock /> {resetError}</div>}
              {resetSuccess && <div className="login-success-alert"><FiCheckCircle /> {resetSuccess}</div>}

              <div className="form-group-pretty">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={resetCurrentPassword} 
                  onChange={e => setResetCurrentPassword(e.target.value)} 
                  placeholder="Current password" 
                  required 
                />
              </div>

              <div className="form-group-pretty">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={resetNewPassword} 
                  onChange={e => setResetNewPassword(e.target.value)} 
                  placeholder="New password (min 4 chars)" 
                  required 
                />
              </div>

              <div className="form-actions-pretty">
                <button type="submit" className="btn-submit-glow" disabled={isResetting}>
                  {isResetting ? <FiRefreshCw className="spin" /> : <FiCheckCircle />} Save New Password
                </button>
                <button type="button" className="btn-cancel-pretty" onClick={() => setShowResetModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-container-inner">

        {/* Mobile Tab Switcher */}
        <div className="admin-mobile-nav">
          <button 
            type="button"
            className={`mobile-tab-btn ${activeMobileTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveMobileTab("inventory")}
          >
            <FiPackage /> Inventory ({filteredProducts.length})
          </button>
          <button 
            type="button"
            className={`mobile-tab-btn ${activeMobileTab === "form" ? "active" : ""}`}
            onClick={() => setActiveMobileTab("form")}
          >
            {editingProductId ? <FiEdit2 /> : <FiPlus />} {editingProductId ? "Edit" : "+ Product"}
          </button>
          <button 
            type="button"
            className={`mobile-tab-btn ${activeMobileTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveMobileTab("categories")}
          >
            <FiTag /> Categories ({categories.length})
          </button>
        </div>

        {/* Main Dashboard Layout */}
        <div className="admin-workspace-grid">
          {/* Left Column: Manage Categories & Product Form */}
          <div className={`admin-form-col ${activeMobileTab === "form" || activeMobileTab === "categories" ? "show-mobile" : ""}`}>

            {/* Product Form Card */}
            <section className={`admin-card-glass ${editingProductId ? "editing-mode" : ""} ${activeMobileTab === "categories" ? "hide-mobile" : ""}`}>
              <div className="admin-card-head">
                <div className="admin-card-title-group">
                  <span className="card-icon-pill">
                    {editingProductId ? <FiEdit2 /> : <FiPlus />}
                  </span>
                  <div>
                    <h2>{editingProductId ? "Edit Product Details" : "Create New Product"}</h2>
                    <p className="card-desc">
                      {editingProductId ? `Updating ID #${editingProductId}` : "Add a new plant or accessory to Diamond Nursery catalog"}
                    </p>
                  </div>
                </div>
                {editingProductId && (
                  <span className="editing-badge">Editing Mode Active</span>
                )}
              </div>

              <form onSubmit={handleSubmitProduct} className="admin-pretty-form">
                <div className="form-group-pretty">
                  <label>Product Title <span className="req">*</span></label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={handleTitleChange} 
                    placeholder="e.g. Adenium Desert Rose Specimen" 
                    required 
                  />
                </div>

                <div className="form-group-pretty">
                  <label>Category Classification</label>
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select a Category (Optional)</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-pretty">
                  <label>Plant Description (Optional)</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Write detailed plant care instructions, light/watering needs, or description..." 
                    rows={4}
                    style={{ width: '100%', padding: '12px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Adenium Specific Options */}
                {categories.find(c => c.id == categoryId)?.name === "Adenium" && (
                  <div className="adenium-special-box">
                    <div className="special-head">
                      <FaLeaf /> <span>Adenium Pot Size Pricing</span>
                    </div>
                    <div className="adenium-inputs">
                      <div>
                        <label>8" Multigrafted Pot (₹)</label>
                        <input type="number" value={adeniumPrice8} onChange={e => setAdeniumPrice8(e.target.value)} placeholder="1200" />
                      </div>
                      <div>
                        <label>10" Multigrafted Pot (₹)</label>
                        <input type="number" value={adeniumPrice10} onChange={e => setAdeniumPrice10(e.target.value)} placeholder="1500" />
                      </div>
                      <div>
                        <label>Single Grafted (₹)</label>
                        <input type="number" value={adeniumPriceSingle} onChange={e => setAdeniumPriceSingle(e.target.value)} placeholder="150" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-row-pretty">
                  <div className="form-group-pretty">
                    <label>Selling Price (₹) <span className="req">*</span></label>
                    <input 
                      type="number" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      placeholder="499" 
                      required 
                    />
                  </div>
                  <div className="form-group-pretty">
                    <label>Original Price (₹)</label>
                    <input 
                      type="number" 
                      value={oldPrice} 
                      onChange={(e) => setOldPrice(e.target.value)} 
                      placeholder="699" 
                    />
                  </div>
                </div>

                {discountPercent > 0 && (
                  <div className="discount-calc-pill">
                    <FiCheckCircle /> Customer saves ₹{numOldPrice - numPrice} ({discountPercent}% OFF badge auto-applied)
                  </div>
                )}

                {/* Image Upload Zone */}
                <div className="form-group-pretty">
                  <label>Product Image <span className="req">*</span></label>
                  
                  {previewUrl ? (
                    <div className="image-preview-card">
                      <img src={previewUrl} alt="Product Preview" />
                      <div className="preview-overlay">
                        <span className="preview-filename">{file ? file.name : "Current Image"}</span>
                        <button type="button" className="btn-remove-img" onClick={clearImage} title="Remove image">
                          <FiX /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="dropzone-modern">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        required={!editingProductId}
                        id="pretty-file-upload"
                      />
                      <label htmlFor="pretty-file-upload" className="dropzone-label">
                        <div className="dropzone-icon">
                          <FiImage />
                        </div>
                        <strong>Click or drag plant image here</strong>
                        <p>JPEG, PNG, WebP up to 10MB (Auto compressed)</p>
                      </label>
                    </div>
                  )}
                </div>

                <div className="form-actions-pretty">
                  <button type="submit" className="btn-submit-glow" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <FiRefreshCw className="spin" /> Processing Image & Saving...
                      </>
                    ) : (
                      <>
                        {editingProductId ? <FiCheckCircle /> : <FiPlus />}
                        {editingProductId ? "Update Product" : "Publish Product"}
                      </>
                    )}
                  </button>
                  {editingProductId && (
                    <button type="button" className="btn-cancel-pretty" onClick={handleCancelEdit}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Manage Categories Section */}
            <section className={`admin-card-glass mt-24 ${activeMobileTab === "form" ? "hide-mobile" : ""}`}>
              <div className="admin-card-head">
                <div className="admin-card-title-group">
                  <span className="card-icon-pill teal">
                    <FiTag />
                  </span>
                  <div>
                    <h2>Category Management</h2>
                    <p className="card-desc">Organize store plants by botanical families or types</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddCategory} className="add-category-row">
                <input 
                  type="text" 
                  value={categoryName} 
                  onChange={handleCategoryNameChange} 
                  placeholder="e.g. Succulents & Cacti" 
                  required 
                />
                <button type="submit" disabled={isAddingCategory} className="btn-add-cat">
                  {isAddingCategory ? <FiRefreshCw className="spin" /> : <FiPlus />} Add
                </button>
              </form>

              <div className="category-pills-wrap">
                {categories.map(cat => {
                  const catProductCount = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <div key={cat.id} className="category-pill-item">
                      <span className="cat-name">{cat.name}</span>
                      <span className="cat-count">{catProductCount} plants</span>
                      <button 
                        type="button"
                        onClick={() => handleDeleteCategory(cat.slug)} 
                        className="cat-del-btn"
                        title="Delete category"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <p className="empty-subtext">No categories created yet.</p>
                )}
              </div>
            </section>

          </div>

          {/* Right Column: Inventory Management & Product List */}
          <div className={`admin-list-col ${activeMobileTab === "inventory" ? "show-mobile" : ""}`}>
            <section className="admin-card-glass inventory-card">
              
              <div className="inventory-header-wrap">
                <div>
                  <h2>Product Inventory ({filteredProducts.length})</h2>
                  <p className="card-desc">Search, review, and manage live products</p>
                </div>
              </div>

              {/* Search and Category Filter Toolbar */}
              <div className="inventory-toolbar">
                <div className="inventory-search">
                  <FiSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search by title or slug..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-btn" onClick={() => setSearchQuery("")}>
                      <FiX />
                    </button>
                  )}
                </div>

                <div className="category-filter-bar">
                  <button 
                    className={`filter-chip ${selectedFilterCategory === "all" ? "active" : ""}`}
                    onClick={() => setSelectedFilterCategory("all")}
                  >
                    All ({products.length})
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      className={`filter-chip ${selectedFilterCategory === cat.id.toString() ? "active" : ""}`}
                      onClick={() => setSelectedFilterCategory(cat.id.toString())}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Cards List */}
              {isLoading ? (
                <div className="admin-loading-state">
                  <FiRefreshCw className="spin large" />
                  <p>Loading inventory items...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="empty-icon-wrap">
                    <FiPackage />
                  </div>
                  <h3>No products found</h3>
                  <p>{searchQuery ? "Try clearing search filter" : "Add your first plant using the form on the left"}</p>
                </div>
              ) : (
                <div className="inventory-grid">
                  {filteredProducts.map(product => {
                    const isEditingThis = editingProductId === product.id;
                    const catObj = categories.find(c => c.id === product.categoryId);
                    const prodPrice = parseFloat(product.price);
                    const prodOldPrice = parseFloat(product.oldPrice);
                    const hasDiscount = prodOldPrice && prodOldPrice > prodPrice;

                    return (
                      <article key={product.id || product.slug} className={`inventory-item-card ${isEditingThis ? "active-editing" : ""}`}>
                        <div className="item-thumb-wrap">
                          <img src={product.image} alt={product.title} />
                          {hasDiscount && (
                            <span className="item-discount-badge">
                              -{Math.round(((prodOldPrice - prodPrice) / prodOldPrice) * 100)}%
                            </span>
                          )}
                        </div>

                        <div className="item-info">
                          <div className="item-title-row">
                            <h3 className="item-title">{product.title}</h3>
                            {catObj && <span className="item-cat-badge">{catObj.name}</span>}
                          </div>

                          <div className="item-price-row">
                            <strong className="current-price">₹{product.price}</strong>
                            {product.oldPrice && <span className="old-price">₹{product.oldPrice}</span>}
                          </div>

                          {product.adeniumOptions && (
                            <div className="item-adenium-badge">
                              <FaLeaf /> Multigrafted Varieties Configured
                            </div>
                          )}
                        </div>

                        <div className="item-actions">
                          <button 
                            className="action-btn-edit" 
                            onClick={() => handleEditProduct(product)}
                            title="Edit Product"
                          >
                            <FiEdit2 /> Edit
                          </button>
                          <button 
                            className="action-btn-del" 
                            onClick={() => handleDeleteProduct(product.slug)}
                            title="Delete Product"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
