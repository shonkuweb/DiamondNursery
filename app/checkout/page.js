"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiChevronRight,
  FiGrid,
  FiHome,
  FiLock,
  FiPackage,
  FiX,
  FiShield,
  FiCheckCircle,
  FiTruck
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { categories as menuCategories } from "../data/categories";

const toAmount = (value) => {
  const match = String(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { items: cartItems, clear, setIsSidebarOpen } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", pincode: "", address: "" });
  const [selectedAdeniumOptions, setSelectedAdeniumOptions] = useState([]);

  const hasAdenium = cartItems.some(item => item.title?.toLowerCase().includes('adenium') || item.slug?.toLowerCase().includes('adenium'));

  const ADENIUM_CHECKOUT_OPTIONS = [
    'Addenium Multigrafted 8" Pot 1200',
    'Addenium Multigrafted 10" Pot 1500',
    'Addenium Single grafted 150'
  ];

  const itemTotal = cartItems.reduce((sum, i) => sum + toAmount(i.price) * i.qty, 0);
  const grandTotal = itemTotal;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const placeOrder = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.pincode.trim()) {
      alert("Please fill in all delivery details.");
      return;
    }
    if (hasAdenium && selectedAdeniumOptions.length === 0) {
      alert("Please select at least one Adenium option.");
      return;
    }
    const orderId = `DN-${Date.now().toString().slice(-6)}`;
    const order = {
      id: orderId,
      customer: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      pincode: form.pincode.trim(),
      total: `Rs. ${grandTotal.toFixed(2)}`,
      status: "Pending",
      placedAt: new Date().toISOString(),
      items: cartItems.map((i) => ({ title: i.title, qty: i.qty, price: i.price }))
    };
    try {
      const existing = JSON.parse(localStorage.getItem("admin-orders") || "[]");
      localStorage.setItem("admin-orders", JSON.stringify([order, ...existing]));
    } catch {
      localStorage.setItem("admin-orders", JSON.stringify([order]));
    }

    let message = `*New Order: ${orderId}*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${form.name.trim()}\n`;
    message += `Phone: ${form.phone.trim()}\n`;
    message += `Address: ${form.address.trim()}\n`;
    message += `Pincode: ${form.pincode.trim()}\n\n`;
    message += `*Order Items:*\n`;
    cartItems.forEach(item => {
      message += `- ${item.title} (x${item.qty}) - Rs. ${(toAmount(item.price) * item.qty).toFixed(2)}\n`;
    });
    message += `\n*Item Subtotal:* Rs. ${itemTotal.toFixed(2)}\n`;
    message += `*Delivery Charge:* To be decided by Admin\n`;
    message += `*Payable Subtotal:* Rs. ${grandTotal.toFixed(2)} (+ delivery charge as confirmed by Admin)`;

    if (hasAdenium && selectedAdeniumOptions.length > 0) {
      message += `\n\n*Selected Adenium Options:*\n`;
      selectedAdeniumOptions.forEach(opt => {
        message += `✅ ${opt}\n`;
      });
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/917319064254?text=${encodedMessage}`;
    
    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank');

    clear();
    router.push(`/track-order?id=${orderId}`);
  };

  return (
    <main className="mobile-page">
      <section className="checkout-shell-modern">
        <div className="secure-pill-modern">
          <FiLock /> Secure Checkout
        </div>
        
        <h1>Complete Your Order</h1>
        
        {cartItems.length === 0 && <p className="empty-small">Your cart is empty.</p>}
        
        <div className="checkout-card-modern">
          <div className="card-head">
            <h3>
              <span className="step-badge-modern">1</span>Delivery Details
            </h3>
          </div>
          <input className="checkout-input-modern" placeholder="Full Name" value={form.name} onChange={updateField("name")} />
          <input className="checkout-input-modern" placeholder="Phone Number" type="tel" value={form.phone} onChange={updateField("phone")} />
          <input className="checkout-input-modern" placeholder="Pincode" type="number" value={form.pincode} onChange={updateField("pincode")} />
          <textarea className="checkout-input-modern" placeholder="Full Address (House No, Street, Landmark)" rows={3} value={form.address} onChange={updateField("address")} style={{ marginBottom: 0 }} />
        </div>

        {hasAdenium && (
          <div className="checkout-card-modern">
            <div className="card-head">
              <h3>
                <span className="step-badge-modern" style={{ background: 'linear-gradient(135deg, #f1512f 0%, #c43212 100%)' }}>!</span>
                Adenium Options
              </h3>
            </div>
            <p style={{ fontSize: '14px', marginBottom: '16px', color: '#666', lineHeight: 1.5 }}>
              Please select your preferred Adenium pot sizes (you can choose multiple):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ADENIUM_CHECKOUT_OPTIONS.map((opt) => {
                const isSelected = selectedAdeniumOptions.includes(opt);
                return (
                  <label key={opt} className={`adenium-option-modern ${isSelected ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      className="adenium-checkbox-modern"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAdeniumOptions(prev => [...prev, opt]);
                        } else {
                          setSelectedAdeniumOptions(prev => prev.filter(o => o !== opt));
                        }
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="checkout-card-modern bill-card-modern">
          <div className="card-head">
            <h3>
              <span className="step-badge-modern">2</span>Order Summary
            </h3>
          </div>
          
          {cartItems.length === 0 && <p className="empty-small">No products selected.</p>}
          
          <div className="order-lines-modern">
            {cartItems.map((item) => (
              <div className="order-line-modern" key={`${item.slug}-${item.variant || 'base'}`}>
                <div 
                  className={`cart-item-img ${item.imageClass || ''}`} 
                  style={{ 
                    width: 64, 
                    height: 64, 
                    ...(item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {})
                  }} 
                />
                <div className="order-line-info-modern">
                  <p>{item.title}</p>
                  <span>Variant: {item.variant || 'Base'} • Qty: {item.qty}</span>
                </div>
                <strong className="order-line-total-modern">
                  Rs. {(toAmount(item.price) * item.qty).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <div className="bill-summary-row">
              <span>Item Subtotal</span>
              <strong>Rs. {itemTotal.toFixed(2)}</strong>
            </div>
            <div className="bill-summary-row">
              <span>Delivery Charge</span>
              <strong style={{ color: '#16a34a', fontSize: '13px' }}>To be decided by Admin</strong>
            </div>
            <div className="bill-total-row">
              <span>Total Subtotal</span>
              <strong>Rs. {grandTotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>


        <button type="button" className="checkout-btn-whatsapp-modern" onClick={placeOrder}>
          <div className="checkout-btn-whatsapp-content">
            <FaWhatsapp size={24} />
            <span>Order via WhatsApp</span>
          </div>
          {cartItems.length > 0 && <span>Rs. {grandTotal.toFixed(2)}</span>}
        </button>
        <p className="checkout-secure-note-modern">
          <FiLock /> Your order will be placed securely via WhatsApp
        </p>
      </section>

      {menuOpen && <button className="menu-overlay blur-overlay" aria-label="Close menu overlay" onClick={() => setMenuOpen(false)} />}
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
