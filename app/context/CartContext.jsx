"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setProductsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setProductsLoading(false);
      });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("diamond-nursery-cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("diamond-nursery-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (slug, qty = 1, variant = null) => {
    setItems((prev) => {
      const found = prev.find((i) => i.slug === slug && i.variant === variant);
      if (found) {
        return prev.map((i) => (i.slug === slug && i.variant === variant ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { slug, qty, variant }];
    });
  };

  const updateQty = (slug, variant, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => !(i.slug === slug && i.variant === variant)));
      return;
    }
    setItems((prev) => prev.map((i) => (i.slug === slug && i.variant === variant ? { ...i, qty } : i)));
  };

  const removeItem = (slug, variant) => setItems((prev) => prev.filter((i) => !(i.slug === slug && i.variant === variant)));
  const clear = () => setItems([]);

  const detailedItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((p) => p.slug === item.slug);
          if (!product) return null;
          let price = product.price;
          if (item.variant && product.adeniumOptions && product.adeniumOptions[item.variant]) {
            price = product.adeniumOptions[item.variant];
          }
          return { ...product, qty: item.qty, variant: item.variant, price };
        })
        .filter(Boolean),
    [items, products]
  );

  return (
    <CartContext.Provider value={{ items: detailedItems, addItem, updateQty, removeItem, clear, products, productsLoading, isSidebarOpen, setIsSidebarOpen, isMenuOpen, setIsMenuOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
