"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiChevronRight,
  FiChevronDown,
  FiGrid,
  FiHome,
  FiMenu,
  FiMinus,
  FiPackage,
  FiPlus,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTruck,
  FiUser,
  FiX
} from "react-icons/fi";
import { FaWhatsapp, FaLeaf } from "react-icons/fa";
import { categories as menuCategories } from "../../data/categories";
import { useCart } from "../../context/CartContext";



const highlights = [
  "Healthy, well-rooted live plant",
  "Air-purifying & easy to maintain",
  "Ships in protective eco packaging",
  "14-day replacement guarantee"
];

export default function ProductPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [variantQtys, setVariantQtys] = useState({});
  const [openAccordion, setOpenAccordion] = useState(0);
  const { addItem, products, productsLoading, setIsSidebarOpen } = useCart();
  const product = products.find((item) => item.slug === slug);

  const accordionData = [
    {
      title: "Product Description",
      body: product?.description || "A lush, hand-picked plant nurtured in our Kolkata nursery. Each plant is healthy, well-rooted and ready to thrive in your home or balcony garden with minimal care."
    },
    {
      title: "Delivery & Returns",
      body: "Dispatched within 24 hours with safe, breathable packaging. One-day delivery across Kolkata and a 14-day replacement guarantee on every order."
    }
  ];

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (productsLoading) {
    return (
      <main className="mobile-page product-page">
        <div className="top-strip">Loading...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mobile-page product-page">
        <div className="top-strip">Product not found</div>
      </main>
    );
  }

  const related = products.filter((item) => item.slug !== product.slug).slice(0, 3);
  const ratingValue = Math.round(parseFloat(product.rating));
  const availableVariants = product?.adeniumOptions ? Object.keys(product.adeniumOptions).filter(k => product.adeniumOptions[k] !== null && product.adeniumOptions[k] !== "") : [];

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (availableVariants.length > 0) {
      const selected = Object.entries(variantQtys).filter(([v, q]) => q > 0);
      if (selected.length === 0) {
        alert("Please select at least one option.");
        return;
      }
      selected.forEach(([v, q]) => addItem(product.slug, q, v));
    } else {
      addItem(product.slug, qty);
    }
    router.push('/cart');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (availableVariants.length > 0) {
      const selected = Object.entries(variantQtys).filter(([v, q]) => q > 0);
      if (selected.length === 0) {
        alert("Please select at least one option.");
        return;
      }
      selected.forEach(([v, q]) => addItem(product.slug, q, v));
    } else {
      addItem(product.slug, qty);
    }
    router.push('/checkout');
  };

  return (
    <main className="mobile-page product-page">

      <header className="header">
        <button className="icon-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <FiMenu />
        </button>
        <Link href="/" className="header-center" aria-label="Diamond Nursery home" style={{ textDecoration: 'none', color: '#1f6b2c', fontSize: '20px', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.2' }}>
          Diamond Nursery
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
          <input type="text" placeholder="Search plants, pots..." aria-label="Search" />
        </div>
      </div>

      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Best Sellers</span>
        <span>/</span>
        <span className="crumb-muted">{product.title}</span>
      </div>

      <section className="product-hero-image">
        <div className="product-detail-image">
          <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <span className="hero-badge">{product.offer}</span>
          <span className="hero-leaf"><FaLeaf /> Live Plant</span>
        </div>
      </section>

      <section className="product-detail-body">
        <p className="brand-eyebrow">Diamond Nursery · Best Seller</p>
        <h1>{product.title}</h1>

        <div className="rating-line">
          <span className="stars" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <FiStar key={n} className={n <= ratingValue ? "star filled" : "star"} />
            ))}
          </span>
          <strong>{product.rating}</strong>
          <span className="rating-count">({product.reviews} reviews)</span>
        </div>

        <p className="urgent-pill">🔥 36 sold in the last 24 hours</p>

        <div className="price-row">
          {!availableVariants.length && (
            <>
              <strong>₹{product.price}</strong>
              {product.oldPrice && <span>₹{product.oldPrice}</span>}
              <em className="offer-pill inline">{product.offer}</em>
            </>
          )}
          {availableVariants.length > 0 && (
            <em className="offer-pill inline">{product.offer}</em>
          )}
        </div>
        <p className="tax-note">Inclusive of all taxes</p>
        <p className="viewing-now">👀 12 people are viewing this right now</p>

        <div className="delivery-box">
          <p>Check delivery & availability</p>
          <div className="pin-row">
            <input placeholder="Enter Pincode" aria-label="Enter pincode" />
            <button type="button">Check</button>
          </div>
        </div>

        {availableVariants.length > 0 ? (
          <div className="variants-section" style={{marginBottom: '20px', padding: '16px', background: '#f5f8f6', borderRadius: '8px'}}>
            <h3 style={{marginBottom: '12px', fontSize: '16px'}}>Select Options:</h3>
            {availableVariants.map(variant => {
              const vQty = variantQtys[variant] || 0;
              return (
                <div key={variant} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                  <div>
                    <strong>{variant}</strong>
                    <div style={{fontSize: '14px', color: '#1f6b2c'}}>₹{product.adeniumOptions[variant]}</div>
                  </div>
                  <div className="qty-box" style={{margin: 0}}>
                    <button type="button" aria-label="Decrease quantity" onClick={() => setVariantQtys(prev => ({...prev, [variant]: Math.max(0, (prev[variant] || 0) - 1)}))}>
                      <FiMinus />
                    </button>
                    <strong>{vQty}</strong>
                    <button type="button" aria-label="Increase quantity" onClick={() => setVariantQtys(prev => ({...prev, [variant]: (prev[variant] || 0) + 1}))}>
                      <FiPlus />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="qty-row">
            <span>Qty:</span>
            <div className="qty-box">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <FiMinus />
              </button>
              <strong>{qty}</strong>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                <FiPlus />
              </button>
            </div>
          </div>
        )}

        <div className="cta-row">
          <button onClick={handleAddToCart} className="add-btn ghost">
            Add to Cart
          </button>
          <button onClick={handleBuyNow} className="add-btn">
            Buy It Now
          </button>
        </div>
      </section>



      <section className="recommend-wrap">
        <h3>You May Also Like</h3>
        <div className="recommend-row">
          {related.map((item) => (
            <article key={item.slug} className="recommend-card">
              <span className="offer-pill">{item.offer}</span>
              <Link href={`/product/${item.slug}`} className={`product-image ${item.imageClass}`} />
              <div className="product-info">
                <p className="product-title">{item.title}</p>
                <div className="price-row">
                  <strong>{item.price}</strong>
                  <span>{item.oldPrice}</span>
                </div>
                <Link href={`/product/${item.slug}`} className="add-btn">View</Link>
              </div>
            </article>
          ))}
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

      <nav className="bottom-nav visible" aria-label="Primary navigation">
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
