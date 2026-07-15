export const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

export const getOrderItemsByStatus = (items = [], status) =>
  items.filter((item) => item.status === status);

export const getCancelledItems = (items = []) =>
  items.filter((item) =>
    ["CANCELLED", "REJECTED", "REMOVED"].includes(item.status),
  );
