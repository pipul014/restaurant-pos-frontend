//final kds
import { axiosWrapper } from "./axiosWrapper";

// Auth APIs
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const logout = () => axiosWrapper.post("/api/user/logout");
export const getUserData = () => axiosWrapper.get("/api/user");

// Staff APIs
export const createStaff = (data) => axiosWrapper.post("/api/user/staff", data);
export const getStaffUsers = () => axiosWrapper.get("/api/user/staff");

export const deleteStaffUser = (id) =>
  axiosWrapper.delete(`/api/user/staff/${id}`);

export const resetStaffPassword = ({ id, password }) =>
  axiosWrapper.put(`/api/user/staff/${id}/reset-password`, { password });

export const adminChangeOwnPassword = (data) =>
  axiosWrapper.put("/api/user/admin/change-password", data);

// Table APIs
export const addTable = (data) => axiosWrapper.post("/api/table", data);
export const getTables = () => axiosWrapper.get("/api/table");

export const updateTable = ({ tableId, status, orderId }) =>
  axiosWrapper.put(`/api/table/${tableId}`, {
    status,
    orderId,
  });

// Category APIs

export const getCategories = (params) =>
  axiosWrapper.get("/api/category", { params });

export const addCategory = (data) => axiosWrapper.post("/api/category", data);

export const updateCategory = ({ categoryId, ...data }) =>
  axiosWrapper.put(`/api/category/${categoryId}`, data);

export const deleteCategory = (categoryId) =>
  axiosWrapper.delete(`/api/category/${categoryId}`);

// Dish APIs
export const addDish = (data) => axiosWrapper.post("/api/dish", data);
export const getDishes = (params = {}) =>
  axiosWrapper.get("/api/dish", { params });

export const getDishesByCategory = (categoryId) =>
  axiosWrapper.get(`/api/dish/category/${categoryId}`);

export const updateDish = ({ dishId, ...data }) =>
  axiosWrapper.put(`/api/dish/${dishId}`, data);

export const updateDailyPreparedQuantity = ({
  dishId,
  dailyPreparedQuantity,
}) =>
  axiosWrapper.put(`/api/dish/${dishId}/daily-stock`, {
    dailyPreparedQuantity,
  });

export const deleteDish = (dishId) =>
  axiosWrapper.delete(`/api/dish/${dishId}`);

// Order APIs
export const addOrder = (data) => axiosWrapper.post("/api/order", data);
export const getOrders = (params = {}) =>
  axiosWrapper.get("/api/order", { params });

export const getOrderById = (orderId) =>
  axiosWrapper.get(`/api/order/${orderId}`);

export const addItemsToExistingOrder = ({ orderId, items }) =>
  axiosWrapper.put(`/api/order/${orderId}/add-items`, { items });

// Item-level Kitchen APIs
export const acceptOrderItem = ({
  orderId,
  itemId,
  estimatedPreparationMinutes,
}) =>
  axiosWrapper.put(`/api/order/${orderId}/items/${itemId}/accept`, {
    estimatedPreparationMinutes,
  });

export const updateItemPreparationTime = ({
  orderId,
  itemId,
  estimatedPreparationMinutes,
}) =>
  axiosWrapper.put(`/api/order/${orderId}/items/${itemId}/preparation-time`, {
    estimatedPreparationMinutes,
  });

export const rejectOrderItem = ({ orderId, itemId, reason }) =>
  axiosWrapper.put(`/api/order/${orderId}/items/${itemId}/reject`, {
    reason,
  });

export const markItemReady = ({ orderId, itemId }) =>
  axiosWrapper.put(`/api/order/${orderId}/items/${itemId}/ready`);

export const markItemServed = ({ orderId, itemId }) =>
  axiosWrapper.put(`/api/order/${orderId}/items/${itemId}/served`);

// Pre-accept modification APIs
export const updateItemQuantity = ({ orderId, itemId, quantity }) =>
  axiosWrapper.put(`/api/order/${orderId}/items/${itemId}/quantity`, {
    quantity,
  });

export const updateItemNote = ({ orderId, itemId, notes }) =>
  axiosWrapper.put(`/api/order/${orderId}/items/${itemId}/note`, {
    notes,
  });

export const cancelItem = ({ orderId, itemId, reason }) =>
  axiosWrapper.put(`/api/order/${orderId}/items/${itemId}/cancel`, {
    reason,
  });

export const cancelOrder = ({ orderId, reason }) =>
  axiosWrapper.put(`/api/order/${orderId}/cancel`, {
    reason,
  });

// Billing APIs
export const applyBillDiscount = ({
  orderId,
  billDiscountType,
  billDiscountValue,
}) =>
  axiosWrapper.put(`/api/order/${orderId}/discount`, {
    billDiscountType,
    billDiscountValue,
  });

export const payOrder = ({
  orderId,
  paymentMethod,
  paymentId,
  razorpay_order_id,
  razorpay_payment_id,
  paymentReference,
}) =>
  axiosWrapper.put(`/api/order/${orderId}/pay`, {
    paymentMethod,
    paymentId,
    razorpay_order_id,
    razorpay_payment_id,
    paymentReference,
  });

// Razorpay / Payment APIs
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);

export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment/verify-payment", data);

export const createOfflinePayment = (data) =>
  axiosWrapper.post("/api/payment/offline-payment", data);

export const getPayments = (params = {}) =>
  axiosWrapper.get("/api/payment/payments", { params });

// Notification APIs
export const getNotifications = (params = {}) =>
  axiosWrapper.get("/api/notification", { params });

export const markNotificationRead = (notificationId) =>
  axiosWrapper.put(`/api/notification/${notificationId}/read`);

export const markAllNotificationsRead = () =>
  axiosWrapper.put("/api/notification/read-all");

export const deleteNotification = (notificationId) =>
  axiosWrapper.delete(`/api/notification/${notificationId}`);

export const deleteAllNotifications = () =>
  axiosWrapper.delete("/api/notification/delete-all");

// Customer APIs
export const updateCustomerDetails = ({ orderId, customerDetails }) =>
  axiosWrapper.put(`/api/order/${orderId}/customer`, customerDetails);

export const searchCustomers = (query) =>
  axiosWrapper.get("/api/customer/search", {
    params: { q: query },
  });

// Purchase APIs
export const addPurchase = (data) => axiosWrapper.post("/api/purchase", data);

export const getPurchases = (params = {}) =>
  axiosWrapper.get("/api/purchase", { params });

export const getPurchaseById = (purchaseId) =>
  axiosWrapper.get(`/api/purchase/${purchaseId}`);

export const payPurchaseDue = ({ purchaseId, ...data }) =>
  axiosWrapper.put(`/api/purchase/${purchaseId}/pay`, data);

export const deletePurchase = (purchaseId) =>
  axiosWrapper.delete(`/api/purchase/${purchaseId}`);

export const searchVendors = (query) =>
  axiosWrapper.get("/api/purchase/vendors/search", {
    params: { q: query },
  });

// Salary APIs
export const addSalary = (data) => axiosWrapper.post("/api/salary", data);
export const getSalaries = (params = {}) =>
  axiosWrapper.get("/api/salary", { params });

export const paySalaryDue = ({ salaryId, ...data }) =>
  axiosWrapper.put(`/api/salary/${salaryId}/pay`, data);

export const deleteSalary = (salaryId) =>
  axiosWrapper.delete(`/api/salary/${salaryId}`);

//show invoice
export const getPublicInvoice = (invoiceNo) =>
  axiosWrapper.get(`/api/public/invoice/${invoiceNo}`);

export const getSoldItems = (params = {}) =>
  axiosWrapper.get("/api/order/sold-items", { params });

export const deleteOrder = (orderId) =>
  axiosWrapper.delete(`/api/order/${orderId}`);

// ===============================
// Public Order Tracking APIs
// ===============================

export const getPublicOrderTracking = (trackingToken) =>
  axiosWrapper.get(`/api/public/track/${trackingToken}`);

export const getPublicTrackingStatus = (trackingToken) =>
  axiosWrapper.get(`/api/public/track/${trackingToken}/status`);

export const shareOrderTrackingWhatsapp = (trackingToken) =>
  axiosWrapper.get(`/api/public/track/${trackingToken}/share`);

export const getRestaurantSettings = () => axiosWrapper.get("/api/settings");
export const updateRestaurantWorkflow = (workflow) => axiosWrapper.patch("/api/settings/workflow", { workflow });
