import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "./api.context";

const EcomContext = createContext(null);

export const useEcom = () => {
  const ctx = useContext(EcomContext);
  if (!ctx) {
    throw new Error("useEcom must be used within an <EcomProvider>");
  }
  return ctx;
};

const RECENTLY_VIEWED_KEY = "torque_recently_viewed";

// Sample locations for dynamic social proof notifications
const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", 
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Chandigarh"
];
const NAMES = [
  "Aarav", "Ananya", "Rohan", "Priya", "Vikram", 
  "Sneha", "Karan", "Diya", "Arjun", "Meera"
];

export const EcomProvider = ({ children }) => {
  const { products, settings } = useApi();
  const allProducts = products?.list || [];

  // ─── Fetch Backend Settings on Mount ──────────────────────────────
  useEffect(() => {
    if (settings?.fetchPublic) {
      settings.fetchPublic();
    }
  }, []);

  const settingValues = settings?.values || {};

  // ─── 1. Recently Viewed State ─────────────────────────────────────
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addRecentlyViewed = useCallback((product) => {
    if (!product || !product._id) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p._id !== product._id);
      const updated = [product, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recently viewed item", e);
      }
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch (e) {
      console.error("Failed to clear recently viewed items", e);
    }
  }, []);

  // ─── 2. Recommended & Must-Buy Products (driven by backend limits) ─
  const recommendedLimit = Number(settingValues.ecom_recommended_count ?? 8);
  const mustBuyLimit = Number(settingValues.ecom_must_buy_count ?? 4);

  const recommendedProducts = useMemo(() => {
    if (!allProducts.length) return [];
    return [...allProducts].sort(() => 0.5 - Math.random()).slice(0, recommendedLimit);
  }, [allProducts, recommendedLimit]);

  const mustBuyProducts = useMemo(() => {
    if (!allProducts.length) return [];
    return allProducts.filter((p) => p.stock > 0).slice(0, mustBuyLimit);
  }, [allProducts, mustBuyLimit]);

  const getRecommendedFor = useCallback(
    (productOrCategory, limit = 4) => {
      if (!allProducts.length) return [];
      const cat = typeof productOrCategory === "string" 
        ? productOrCategory 
        : productOrCategory?.category;
      
      const currentId = typeof productOrCategory === "object" ? productOrCategory?._id : null;

      let matched = allProducts.filter((p) => p._id !== currentId);
      if (cat) {
        const catMatched = matched.filter((p) => p.category === cat);
        if (catMatched.length > 0) matched = catMatched;
      }
      return matched.slice(0, limit);
    },
    [allProducts]
  );

  // ─── 3. Frequent Live Sales Notifications ─────────────────────────
  const [activeNotification, setActiveNotification] = useState(null);
  const [userDisabledNotifications, setUserDisabledNotifications] = useState(false);

  const backendNotificationsEnabled = settingValues.ecom_sales_notifications_enabled ?? true;
  const notificationsEnabled = backendNotificationsEnabled && !userDisabledNotifications;

  useEffect(() => {
    if (!notificationsEnabled || !allProducts.length) return;

    const interval = setInterval(() => {
      const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
      const randomMins = Math.floor(Math.random() * 15) + 1;

      if (randomProduct) {
        setActiveNotification({
          id: Date.now(),
          product: randomProduct,
          message: `${randomName} from ${randomCity} purchased ${randomProduct.name}`,
          time: `${randomMins}m ago`,
        });

        // Hide notification after 5 seconds
        setTimeout(() => {
          setActiveNotification(null);
        }, 5000);
      }
    }, 18000); // Trigger notification every 18s

    return () => clearInterval(interval);
  }, [allProducts, notificationsEnabled]);

  // ─── 4. Active Banner / Announcement ──────────────────────────────
  const bannerText = settingValues.ecom_announcement_banner ?? 
    "⚡ SPECIAL OFFER: Get 10% off + Free Shipping on orders over ₹999!";

  const value = {
    // Products Features
    recommendedProducts,
    mustBuyProducts,
    getRecommendedFor,

    // History Features
    recentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed,

    // Social Proof Notifications
    activeNotification,
    notificationsEnabled,
    setNotificationsEnabled: (enabled) => setUserDisabledNotifications(!enabled),
    dismissNotification: () => setActiveNotification(null),

    // Announcement Ticker
    bannerText,
  };

  return (
    <EcomContext.Provider value={value}>
      {children}

      {/* Floating Live Sales Proof Ticker Toast */}
      {activeNotification && (
        <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm bg-background border rounded-xl p-3 shadow-xl flex items-center gap-3 text-xs">
          {activeNotification.product?.images?.[0] && (
            <img
              src={activeNotification.product.images[0]}
              alt={activeNotification.product.name}
              className="size-10 rounded-lg object-cover border shrink-0 bg-muted"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-foreground">
              {activeNotification.message}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Verified Order • {activeNotification.time}
            </p>
          </div>
          <button
            onClick={() => setActiveNotification(null)}
            className="text-muted-foreground hover:text-foreground text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}
    </EcomContext.Provider>
  );
};
