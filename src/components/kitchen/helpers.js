import { normalizeStatus } from "../orders/statusMapper";
import { ITEM_STATUS_PRIORITY } from "./constants";

export const safeText = (value, fallback = "N/A") => value || fallback;

export const getOrderDisplayId = (order) =>
  order?.orderNumber || order?.invoiceNo || `ORD-${order?._id?.slice(-6)}`;

export const getItemsByStatus = (items = [], status) =>
  items.filter((item) => normalizeStatus(item.status) === status);

export const getRejectedCancelledItems = (items = []) =>
  items.filter((item) =>
    ["REJECTED", "CANCELLED", "REMOVED"].includes(normalizeStatus(item.status)),
  );

export const sortKitchenItems = (items = []) => {
  return [...items].sort((a, b) => {
    return (
      (ITEM_STATUS_PRIORITY[normalizeStatus(a.status)] || 99) -
      (ITEM_STATUS_PRIORITY[normalizeStatus(b.status)] || 99)
    );
  });
};

export const getKitchenProgress = (items = []) => {
  if (!items.length) return 0;

  const completed = items.filter((item) =>
    ["READY", "REJECTED", "CANCELLED", "REMOVED", "SERVED", "PAID"].includes(
      normalizeStatus(item.status),
    ),
  ).length;

  return Math.round((completed / items.length) * 100);
};

export const isKitchenOrderUrgent = (order, minutes = 5) => {
  const createdAt = new Date(order?.createdAt).getTime();

  if (!createdAt) return false;

  const hasPending = order?.items?.some(
    (item) => normalizeStatus(item.status) === "PENDING",
  );

  return hasPending && Date.now() - createdAt > minutes * 60 * 1000;
};
