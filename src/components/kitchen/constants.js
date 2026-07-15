export const REJECTION_REASONS = [
  "Item Unavailable",
  "Kitchen Overloaded",
  "Out of Stock",
  "Operational Issue",
];

export const KITCHEN_TABS = [
  "Pending",
  "Preparing",
  "Ready",
  "Rejected/Cancelled",
];

export const ACTIVE_ORDER_STATUSES = [
  "SENT_TO_KITCHEN",
  "PREPARING",
  "PARTIALLY_READY",
  "READY",
  "PARTIALLY_CANCELLED",
];

export const KITCHEN_SOCKET_EVENTS = [
  "ORDER_CREATED",
  "ORDER_ITEM_UPDATED",
  "ORDER_ITEM_CANCELLED",
  "ORDER_ITEM_ACCEPTED",
  "ORDER_ITEM_REJECTED",
  "ORDER_ITEM_READY",
  "ORDER_ITEM_SERVED",
  "ORDER_PAID",
  "ORDER_COMPLETED",
];

export const ITEM_STATUS_PRIORITY = {
  PENDING: 1,
  PREPARING: 2,
  READY: 3,
  REJECTED: 4,
  CANCELLED: 5,
  REMOVED: 6,
  SERVED: 7,
  PAID: 8,
};
