export const normalizeStatus = (status = "") => {
  const value = String(status || "").trim();

  const map = {
    "Sent To Kitchen": "SENT_TO_KITCHEN",
    "SENT TO KITCHEN": "SENT_TO_KITCHEN",
    Sent_To_Kitchen: "SENT_TO_KITCHEN",

    Preparing: "PREPARING",
    Ready: "READY",
    "Partially Ready": "PARTIALLY_READY",
    "Payment Pending": "PAYMENT_PENDING",
    Paid: "PAID",
    Completed: "COMPLETED",
    "Partially Cancelled": "PARTIALLY_CANCELLED",
    Cancelled: "CANCELLED",
    Rejected: "REJECTED",

    Pending: "PENDING",
    Accepted: "ACCEPTED",
    Served: "SERVED",
    Removed: "REMOVED",
  };

  return map[value] || value.toUpperCase().replaceAll(" ", "_");
};

export const displayStatus = (status = "") => {
  const normalized = normalizeStatus(status);

  const map = {
    CREATED: "Created",
    SENT_TO_KITCHEN: "Kitchen",
    PREPARING: "Preparing",
    PARTIALLY_READY: "Partial Ready",
    READY: "Ready",
    PAYMENT_PENDING: "Payment Pending",
    PAID: "Paid",
    COMPLETED: "Completed",
    PARTIALLY_CANCELLED: "Partial Cancel",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",

    PENDING: "Pending",
    ACCEPTED: "Accepted",
    SERVED: "Served",
    REMOVED: "Removed",
  };

  return map[normalized] || normalized.replaceAll("_", " ");
};
