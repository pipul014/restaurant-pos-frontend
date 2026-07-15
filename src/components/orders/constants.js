//fast
export const PAYMENT_METHODS = ["Cash", "QR", "Online"];

export const CANCELLATION_REASONS = [
  "Customer Changed Mind",
  "Wrong Item Selected",
  "Duplicate Order",
  "Item Unavailable",
  "Customer Left",
  "Kitchen Issue",
];

export const REJECTION_REASONS = [
  "Item Unavailable",
  "Kitchen Overloaded",
  "Out of Stock",
  "Operational Issue",
];

export const ITEM_NOTE_OPTIONS = [
  "",
  "Less Spicy",
  "No Onion",
  "Extra Cheese",
  "No Sugar",
  "Extra Sauce",
];

export const STATUS_TABS = [
  {
    label: "All",
    value: "All",
    match: [],
  },
  {
    label: "Kitchen",
    value: "SENT_TO_KITCHEN",
    match: ["SENT_TO_KITCHEN"],
  },
  {
    label: "Preparing",
    value: "PREPARING",
    match: ["PREPARING"],
  },
  {
    label: "Partial Ready",
    value: "PARTIALLY_READY",
    match: ["PARTIALLY_READY"],
  },
  {
    label: "Ready",
    value: "READY",
    match: ["READY"],
  },
  {
    label: "Payment Pending",
    value: "PAYMENT_PENDING",
    match: ["PAYMENT_PENDING"],
  },
  {
    label: "Completed",
    value: "COMPLETED",
    match: ["PAID", "COMPLETED"],
  },
  {
    label: "Partial Cancel",
    value: "PARTIALLY_CANCELLED",
    match: ["PARTIALLY_CANCELLED"],
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
    match: ["CANCELLED", "REJECTED"],
  },
];

export const ORDER_SOCKET_EVENTS = [
  "ORDER_CREATED",
  "ORDER_UPDATED",
  "ORDER_ITEM_ACCEPTED",
  "ORDER_ITEM_REJECTED",
  "ORDER_ITEM_UPDATED",
  "ORDER_ITEM_READY",
  "ORDER_ITEM_SERVED",
  "ORDER_ITEM_CANCELLED",
  "ORDER_CANCELLED",
  "ORDER_PAID",
  "ORDER_COMPLETED",
  "TABLE_UPDATED",
  "ORDERS_SHOULD_REFETCH",
];

export const ACTIVE_ORDER_STATUSES = [
  "SENT_TO_KITCHEN",
  "PREPARING",
  "PARTIALLY_READY",
  "READY",
  "PARTIALLY_CANCELLED",
  "PAYMENT_PENDING",
];

export const COMPLETED_ORDER_STATUSES = ["PAID", "COMPLETED"];

export const CANCELLED_ORDER_STATUSES = ["CANCELLED", "REJECTED"];

export const ITEM_ACTIVE_STATUSES = ["PENDING", "PREPARING", "READY"];

export const ITEM_BILLABLE_STATUSES = ["READY", "SERVED", "PAID"];

export const ITEM_CLOSED_STATUSES = [
  "SERVED",
  "PAID",
  "CANCELLED",
  "REJECTED",
  "REMOVED",
];

export const NOTIFICATION_TYPES = {
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_UPDATED: "ORDER_UPDATED",
  ORDER_ITEM_ACCEPTED: "ORDER_ITEM_ACCEPTED",
  ORDER_ITEM_REJECTED: "ORDER_ITEM_REJECTED",
  ORDER_ITEM_UPDATED: "ORDER_ITEM_UPDATED",
  ORDER_ITEM_READY: "ORDER_ITEM_READY",
  ORDER_ITEM_SERVED: "ORDER_ITEM_SERVED",
  ORDER_ITEM_CANCELLED: "ORDER_ITEM_CANCELLED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  ORDER_PAID: "ORDER_PAID",
  ORDER_COMPLETED: "ORDER_COMPLETED",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
};

export const ORDER_STATUS = {
  CREATED: "CREATED",
  SENT_TO_KITCHEN: "SENT_TO_KITCHEN",
  PREPARING: "PREPARING",
  PARTIALLY_READY: "PARTIALLY_READY",
  READY: "READY",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAID: "PAID",
  COMPLETED: "COMPLETED",
  PARTIALLY_CANCELLED: "PARTIALLY_CANCELLED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
};

export const ITEM_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  SERVED: "SERVED",
  PAID: "PAID",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  REMOVED: "REMOVED",
};
