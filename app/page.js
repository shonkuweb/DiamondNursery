"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FiChevronRight,
  FiGrid,
  FiHome,
  FiMenu,
  FiPackage,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiUser,
  FiX
} from "react-icons/fi";
import { FaLeaf, FaSeedling, FaTree, FaWhatsapp } from "react-icons/fa";
import { GiFlowerPot, GiFlowerTwirl } from "react-icons/gi";
import { categories as defaultCategories } from "./data/categories";
import { useCart } from "./context/CartContext";

export default function Home() {
  const heroEndRef = useRef(null);
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [dbCategories, setDbCategories] = useState([]);
  
  const { addItem, products, productsLoading, setIsSidebarOpen } = useCart();

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbCategories(data);
      })
      .catch(console.error);
  }, []);

  const filteredProducts = (products || []).filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryId ? p.categoryId === parseInt(activeCategoryId) || p.categoryId === activeCategoryId : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const checkHero = () => {
      if (!heroEndRef.current) return;
      const heroEndTop = heroEndRef.current.getBoundingClientRect().top;
      const atTop = window.scrollY <= 4;

      // Show nav right after the hero block ends. Keep it visible while
      // scrolling upward, and hide only when the website top is visible.
      setShowBottomNav((prev) => {
        if (atTop) return false;
        if (heroEndTop <= 0) return true;
        return prev;
      });
    };

    checkHero();
    window.addEventListener("scroll", checkHero, { passive: true });
    window.addEventListener("resize", checkHero);

    return () => {
      window.removeEventListener("scroll", checkHero);
      window.removeEventListener("resize", checkHero);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const heroStyle = {};

  return (
    <main className="mobile-page">


      <header className="header">
        <button className="icon-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <FiMenu />
        </button>
        <Link href="/" className="header-center" aria-label="Diamond Nursery home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev/diamondnursery%20logo.png" 
            alt="Diamond Nursery Logo" 
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
          />
        </Link>
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/admin" className="icon-btn" aria-label="Admin Panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'inherit' }}>
            <FiUser />
          </Link>
          <button className="icon-btn" aria-label="Shopping bag" onClick={() => setIsSidebarOpen(true)}>
            <FiShoppingBag />
          </button>
        </div>
      </header>

      <div className="search-wrap">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search plants, pots..." 
            aria-label="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {!searchQuery && (
        <>
          <section className="hero" style={heroStyle}>
            <div className="hero-overlay">
              <span className="badge">NEW ARRIVALS</span>
              <h2>Bring Life to Your Home</h2>
              <p>Explore our curated collection of indoor plants.</p>
              <button className="cta-btn">Shop Now</button>
            </div>
          </section>
          <div ref={heroEndRef} aria-hidden="true" />

          <div className="notice">
            <p className="notice-track">
              For product replacement, please record a continuous, single-shot video while opening the package.
            </p>
          </div>
        </>
      )}


      <section className="best-sellers">
        <div className="section-title">
          <h2>Trending Plants</h2>

        </div>

        <div className="product-grid">
          {productsLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading plants...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiSearch />
              </div>
              <h4>No plants found</h4>
              <p>We couldn't find any plants matching your search. Try adjusting your filters or browsing our categories.</p>
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>Clear Search</button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <article key={product.id || product.slug} className="product-card">
                <span className="offer-pill">{product.offer}</span>
                <Link href={`/product/${product.slug}`} className="product-image-link" style={{ display: 'block', overflow: 'hidden' }}>
                  <img src={product.image} alt={product.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                </Link>
                <div className="product-info">
                  <p className="product-title">{product.title}</p>
                  <p className="product-rating">☆ ☆ ☆ ☆ ☆ 5.0 | 120 Reviews</p>
                  <div className="price-row">
                    <strong>₹{product.price}</strong>
                    {product.oldPrice && <span>₹{product.oldPrice}</span>}
                  </div>
                  <button className="add-btn" onClick={() => addItem(product.slug, 1)}>
                    Add to Cart
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {menuOpen && <button className="menu-overlay" aria-label="Close menu overlay" onClick={() => setMenuOpen(false)} />}
      <aside className={`side-menu ${menuOpen ? "open" : ""}`} aria-label="Website menu">
        <div className="side-menu-head">
          <strong>Menu</strong>
          <button className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <FiX />
          </button>
        </div>
        <nav className="side-menu-links">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home <FiChevronRight />
          </Link>
          <button type="button" className="side-menu-link-btn" onClick={() => {
            setMenuOpen(false);
            setIsSidebarOpen(true);
          }}>
            Cart <FiChevronRight />
          </button>
          <Link href="/checkout" onClick={() => setMenuOpen(false)}>
            Checkout <FiChevronRight />
          </Link>

        </nav>
      </aside>



      <nav className={`bottom-nav ${showBottomNav ? "visible" : ""}`} aria-label="Primary navigation">
        <Link href="/" className="bottom-item" aria-label="Home">
          <span className="bottom-icon">
            <FiHome />
          </span>
          <span>Home</span>
        </Link>
        <button className="bottom-item" type="button" aria-label="Menu" onClick={() => setMenuOpen(true)}>
          <span className="bottom-icon">
            <FiGrid />
          </span>
          <span>Menu</span>
        </button>
        <button className="bottom-item" type="button" aria-label="Cart" onClick={() => setIsSidebarOpen(true)}>
          <span className="bottom-icon">
            <FiPackage />
          </span>
          <span>Cart</span>
        </button>
        <a href="https://wa.me/917319064254" className="bottom-item" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <span className="bottom-icon" style={{ color: '#25D366' }}>
            <FaWhatsapp />
          </span>
          <span>WhatsApp</span>
        </a>
      </nav>
    </main>
  );
}
