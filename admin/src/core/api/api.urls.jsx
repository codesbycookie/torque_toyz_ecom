const base_url = import.meta.env.VITE_BASE_URL;

const apiurls = {
  auth: {
    login: { method: "post", url: () => `${base_url}/auths/login` },
    me: { method: "get", url: () => `${base_url}/auths/me` },
    logout: { method: "post", url: () => `${base_url}/auths/logout` },
    changePassword: {
      method: "post",
      url: () => `${base_url}/auths/change-password`,
    },
    adminResetPassword: {
      method: "post",
      url: () => `${base_url}/auths/admin/reset-password`,
    },
  },

  users: {
    create: { method: "post", url: () => `${base_url}/users` },
    getAll: { method: "get", url: () => `${base_url}/users` },
    getOne: { method: "get", url: (id) => `${base_url}/users/${id}` },
    edit: { method: "put", url: (id) => `${base_url}/users/${id}` },
    delete: { method: "delete", url: (id) => `${base_url}/users/${id}` },
    setActiveStatus: {
      method: "patch",
      url: (id) => `${base_url}/users/${id}/active-status`,
    },
    retrieve: {
      method: "put",
      url: (id) => `${base_url}/users/${id}/retrieve`,
    },
    erase: { method: "delete", url: (id) => `${base_url}/users/${id}/erase` },
  },

  products: {
    create: { method: "post", url: () => `${base_url}/products` },
    getAll: { method: "get", url: () => `${base_url}/products` },
    getOne: { method: "get", url: (id) => `${base_url}/products/${id}` },
    getBySlug: {
      method: "get",
      url: (slug) => `${base_url}/products/${slug}`,
    },
    edit: { method: "put", url: (id) => `${base_url}/products/${id}` },
    delete: { method: "delete", url: (id) => `${base_url}/products/${id}` },
    setActiveStatus: {
      method: "patch",
      url: (id) => `${base_url}/products/${id}/active-status`,
    },
    retrieve: {
      method: "put",
      url: (id) => `${base_url}/products/${id}/retrieve`,
    },
    erase: {
      method: "delete",
      url: (id) => `${base_url}/products/${id}/erase`,
    },
  },

  categories: {
    create: { method: "post", url: () => `${base_url}/categories` },
    getAll: { method: "get", url: () => `${base_url}/categories` },
    getBySlug: {
      method: "get",
      url: (slug) => `${base_url}/categories/slug/${slug}`,
    },
    getOne: { method: "get", url: (id) => `${base_url}/categories/${id}` },
    edit: { method: "put", url: (id) => `${base_url}/categories/${id}` },
    delete: {
      method: "delete",
      url: (id) => `${base_url}/categories/${id}`,
    },
    setActiveStatus: {
      method: "patch",
      url: (id) => `${base_url}/categories/${id}/active-status`,
    },
  },

  locations: {
    create: { method: "post", url: () => `${base_url}/locations` },
    getAll: { method: "get", url: () => `${base_url}/locations` },
    getOne: { method: "get", url: (id) => `${base_url}/locations/${id}` },
    edit: { method: "put", url: (id) => `${base_url}/locations/${id}` },
    delete: { method: "delete", url: (id) => `${base_url}/locations/${id}` },
    getRate: {
      method: "get",
      url: (id, kgs) => `${base_url}/locations/${id}/rate?kgs=${kgs}`,
    },
    setDeliverableStatus: {
      method: "patch",
      url: (id) => `${base_url}/locations/${id}/deliverable-status`,
    },
    addSlab: {
      method: "post",
      url: (id) => `${base_url}/locations/${id}/slabs`,
    },
    updateSlab: {
      method: "put",
      url: (id, slabId) => `${base_url}/locations/${id}/slabs/${slabId}`,
    },
    removeSlab: {
      method: "delete",
      url: (id, slabId) => `${base_url}/locations/${id}/slabs/${slabId}`,
    },
  },

  orders: {
    create: { method: "post", url: () => `${base_url}/orders` },
    getAll: { method: "get", url: () => `${base_url}/orders` },
    getMine: { method: "get", url: () => `${base_url}/orders/mine` },
    getOne: { method: "get", url: (id) => `${base_url}/orders/${id}` },
    delete: { method: "delete", url: (id) => `${base_url}/orders/${id}` },
    updateStatus: {
      method: "patch",
      url: (id) => `${base_url}/orders/${id}/status`,
    },
    updatePaymentStatus: {
      method: "patch",
      url: (id) => `${base_url}/orders/${id}/payment-status`,
    },
    updateDeliveryPartnerUrl: {
      method: "patch",
      url: (id) => `${base_url}/orders/${id}/delivery-partner-url`,
    },
    retrieve: {
      method: "put",
      url: (id) => `${base_url}/orders/${id}/retrieve`,
    },
  },

  payments: {
    createOrder: {
      method: "post",
      url: () => `${base_url}/payments/create-order`,
    },
    verify: { method: "post", url: () => `${base_url}/payments/verify` },
    refund: { method: "post", url: () => `${base_url}/payments/refund` },
  },

  reviews: {
    create: { method: "post", url: () => `${base_url}/reviews` },
    getAll: { method: "get", url: () => `${base_url}/reviews` },
    getByProduct: {
      method: "get",
      url: (productId) => `${base_url}/reviews/product/${productId}`,
    },
    getOne: { method: "get", url: (id) => `${base_url}/reviews/${id}` },
    edit: { method: "put", url: (id) => `${base_url}/reviews/${id}` },
    delete: { method: "delete", url: (id) => `${base_url}/reviews/${id}` },
    deleteAdmin: {
      method: "delete",
      url: (id) => `${base_url}/reviews/${id}/admin`,
    },
    setActiveStatus: {
      method: "patch",
      url: (id) => `${base_url}/reviews/${id}/active-status`,
    },
    retrieve: {
      method: "put",
      url: (id) => `${base_url}/reviews/${id}/retrieve`,
    },
  },

  wishlist: {
    get: { method: "get", url: () => `${base_url}/wishlists` },
    addProduct: { method: "post", url: () => `${base_url}/wishlists` },
    removeProduct: {
      method: "delete",
      url: (productId) => `${base_url}/wishlists/${productId}`,
    },
    clear: { method: "delete", url: () => `${base_url}/wishlists` },
  },

  settings: {
    get: { method: "get", url: () => `${base_url}/settings` },
    getRaw: { method: "get", url: () => `${base_url}/settings/raw` },
    downloadDump: { method: "download", url: () => `${base_url}/settings/dump` },
    update: { method: "put", url: (key) => `${base_url}/settings/${key}` },
    bulkUpdate: { method: "put", url: () => `${base_url}/settings/bulk` },
  },

  otp: {
    send: { method: "post", url: () => `${base_url}/otps/send` },
    verify: { method: "post", url: () => `${base_url}/otps/verify` },
  },

  analytics: {
    revenueSummary: {
      method: "get",
      url: () => `${base_url}/analytics/revenue-summary`,
    },
    revenueByMonth: {
      method: "get",
      url: () => `${base_url}/analytics/revenue-by-month`,
    },
    orderStatusBreakdown: {
      method: "get",
      url: () => `${base_url}/analytics/order-status-breakdown`,
    },
    topProducts: {
      method: "get",
      url: () => `${base_url}/analytics/top-products`,
    },
    revenueByLocation: {
      method: "get",
      url: () => `${base_url}/analytics/revenue-by-location`,
    },
    customerInsights: {
      method: "get",
      url: () => `${base_url}/analytics/customer-insights`,
    },
    inventoryVelocity: {
      method: "get",
      url: () => `${base_url}/analytics/inventory-velocity`,
    },
    deliveryPerformance: {
      method: "get",
      url: () => `${base_url}/analytics/delivery-performance`,
    },
    cancellationRefundRate: {
      method: "get",
      url: () => `${base_url}/analytics/cancellation-refund-rate`,
    },
    peakTimes: {
      method: "get",
      url: () => `${base_url}/analytics/peak-times`,
    },
    mostWishlisted: {
      method: "get",
      url: () => `${base_url}/analytics/most-wishlisted`,
    },
    mostReviewed: {
      method: "get",
      url: () => `${base_url}/analytics/most-reviewed`,
    },
  },
};

export { apiurls };