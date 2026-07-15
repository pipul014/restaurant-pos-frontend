//faster
import React, { memo, useMemo } from "react";
import {
  FaEye,
  FaMoneyBillWave,
  FaPlus,
  FaReceipt,
  FaStickyNote,
  FaTrash,
  FaWhatsapp,
} from "react-icons/fa";
import { MdCancel, MdEdit, MdDeleteForever } from "react-icons/md";
import { normalizeStatus } from "./statusMapper";

const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const formatDateTime = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "N/A";

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTableLabel = (order) => {
  if (order?.orderType !== "dinein") return order?.orderType || "Walk-in";
  return order?.table?.tableNo ? `Table ${order.table.tableNo}` : "Dine-in";
};

const getItemTimeLeft = (item, now) => {
  if (!now || !item?.expectedReadyAt) return null;

  const end = new Date(item.expectedReadyAt).getTime();
  if (Number.isNaN(end)) return null;

  const diff = Math.max(end - now, 0);
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const canEditPendingItem = (order, item) => order?.workflow === "POST_BILLING" ? ["PENDING", "SERVED"].includes(normalizeStatus(item.status)) : normalizeStatus(item.status) === "PENDING";

const canCancelItem = (order, item) => {
  const blocked = order?.workflow === "POST_BILLING" ? ["PAID", "CANCELLED", "REJECTED", "REMOVED"] : ["SERVED", "PAID", "CANCELLED", "REJECTED", "REMOVED"];
  return !blocked.includes(normalizeStatus(item.status));
};

const canServeItem = (order, item) => order?.workflow !== "POST_BILLING" && normalizeStatus(item.status) === "READY";

const canPayOrder = (order) => {
  const status = normalizeStatus(order.orderStatus);
  const paymentStatus = normalizeStatus(order.paymentStatus);
  const activeItems = (order.items || []).filter((item) => !["CANCELLED", "REJECTED", "REMOVED"].includes(normalizeStatus(item.status)));
  if (paymentStatus === "PAID" || !activeItems.length || Number(order.grandTotal || 0) <= 0) return false;
  if (order.workflow === "POST_BILLING") return activeItems.every((item) => ["PENDING", "SERVED", "PAID"].includes(normalizeStatus(item.status)));
  return status === "PAYMENT_PENDING" && activeItems.every((item) => ["SERVED", "PAID"].includes(normalizeStatus(item.status)));
};

const handleShareTracking = (order) => {
  const phone = order?.customerDetails?.phone?.replace(/\D/g, "");

  if (!phone || !order?.trackingToken) {
    return;
  }

  const baseUrl = window.location.origin;

  const trackingUrl = `${baseUrl}/track/${order.trackingToken}`;

  const message = `🍽️ Your order has been received.

Order: ${order.orderNumber}

Track your order live:
${trackingUrl}

No login or app required.`;

  window.open(
    `https://wa.me/${phone.startsWith("91") ? phone : `91${phone}`}?text=${encodeURIComponent(message)}`,
    "_blank",
  );
};

const OrderCard = ({
  order,
  now,
  userRole,
  servingItemIds,
  onAddItems,
  onServeItem,
  onCancelItem,
  onCancelOrder,
  onDeleteOrder,
  onUpdateQuantity,
  onUpdateNote,
  onUpdateCustomer,
  onDiscount,
  onPay,
  onShowInvoice,
  onViewDetails,
  loading,
}) => {
  const activeItems = order?.items || [];

  const billableTotal = useMemo(() => {
    return activeItems.reduce((sum, item) => {
      if (!["SERVED", "PAID"].includes(normalizeStatus(item.status))) {
        return sum;
      }

      return (
        sum + Number(item.finalItemPrice || 0) * Number(item.quantity || 1)
      );
    }, 0);
  }, [activeItems]);

  const orderStatus = normalizeStatus(order?.orderStatus);
  const paymentStatus = normalizeStatus(order?.paymentStatus);
  const isAdmin = userRole === "Admin";
  const canShowInvoice =
    ["PAID", "COMPLETED"].includes(paymentStatus) ||
    ["PAID", "COMPLETED"].includes(orderStatus);

  return (
    <div className="bg-[#262626] border border-[#333] rounded-2xl p-4 sm:p-5 text-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-lg break-words">
            {order?.orderNumber || "Order"}
          </h3>

          <p className="text-[#ababab] text-xs mt-1">
            Invoice: {order?.invoiceNo || "N/A"}
          </p>

          <p className="text-[#ababab] text-xs mt-1">
            {formatDateTime(order?.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap sm:justify-end gap-2">
          <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold ${order?.workflow === "POST_BILLING" ? "bg-purple-600" : "bg-orange-500 text-black"}`}>{order?.workflow === "POST_BILLING" ? "POST BILLING" : "KITCHEN"}</span>
          <StatusBadge label={orderStatus} />
          <StatusBadge label={paymentStatus} payment />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <InfoBox
          title="Customer"
          value={order?.customerDetails?.name || "Walk-In Customer"}
        />
        <InfoBox title="Phone" value={order?.customerDetails?.phone || "N/A"} />
        <InfoBox title="Type" value={getTableLabel(order)} />
      </div>

      <div className="mt-4 space-y-3">
        {activeItems.length === 0 ? (
          <p className="text-[#ababab] text-sm">No items found.</p>
        ) : (
          activeItems.map((item) => {
            const itemStatus = normalizeStatus(item.status);
            const timeLeft = getItemTimeLeft(item, now);

            return (
              <div
                key={item._id}
                className="bg-[#1f1f1f] border border-[#333] rounded-xl p-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold break-words">{item.name}</h4>

                    <p className="text-[#ababab] text-xs mt-1">
                      Qty: {item.quantity} × {formatMoney(item.finalItemPrice)}
                    </p>

                    {item.notes && (
                      <p className="text-yellow-400 text-xs mt-1">
                        Note: {item.notes}
                      </p>
                    )}

                    {timeLeft &&
                      ["ACCEPTED", "PREPARING"].includes(itemStatus) && (
                        <p className="text-blue-400 text-xs mt-1">
                          Time left: {timeLeft}
                        </p>
                      )}
                  </div>

                  <div className="flex flex-wrap sm:justify-end gap-2">
                    <StatusBadge label={itemStatus} />

                    <span className="text-sm font-bold">
                      {formatMoney(
                        Number(item.finalItemPrice || 0) *
                          Number(item.quantity || 1),
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {canServeItem(order, item) && (
                    <SmallButton
                      disabled={loading || servingItemIds?.has(item._id)}
                      onClick={() => onServeItem(order, item)}
                      className="bg-green-600"
                    >
                      <FaReceipt />{" "}
                      {servingItemIds?.has(item._id) ? "Serving..." : "Serve"}
                    </SmallButton>
                  )}

                  {canEditPendingItem(order, item) && (
                    <>
                      <SmallButton
                        disabled={loading}
                        onClick={() => onUpdateQuantity(order, item)}
                        className="bg-blue-600"
                      >
                        <MdEdit /> Qty
                      </SmallButton>

                      <SmallButton
                        disabled={loading}
                        onClick={() => onUpdateNote(order, item)}
                        className="bg-purple-600"
                      >
                        <FaStickyNote /> Note
                      </SmallButton>
                    </>
                  )}

                  {canCancelItem(order, item) && (
                    <SmallButton
                      disabled={loading}
                      onClick={() => onCancelItem(order, item)}
                      className="bg-red-600"
                    >
                      <MdCancel /> Cancel
                    </SmallButton>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <AmountBox title="Subtotal" value={formatMoney(order?.subtotal)} />
        <AmountBox
          title="Cat. Disc."
          value={formatMoney(order?.categoryDiscountTotal)}
        />
        <AmountBox
          title="Bill Disc."
          value={formatMoney(order?.billDiscountAmount)}
        />
        <AmountBox
          title="Grand Total"
          value={formatMoney(order?.grandTotal || billableTotal)}
          highlight
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {paymentStatus !== "PAID" && (
          <ActionButton disabled={loading} onClick={() => onAddItems(order)}>
            <FaPlus /> Add Items
          </ActionButton>
        )}

        {paymentStatus !== "PAID" && (
          <ActionButton
            disabled={loading}
            onClick={() => onUpdateCustomer(order)}
          >
            <MdEdit /> Update Customer
          </ActionButton>
        )}

        {paymentStatus !== "PAID" && (
          <ActionButton disabled={loading} onClick={() => onDiscount(order)}>
            <FaMoneyBillWave /> Discount
          </ActionButton>
        )}

        {canPayOrder(order) && (
          <ActionButton disabled={loading} onClick={() => onPay(order)} success>
            <FaReceipt /> Pay
          </ActionButton>
        )}

        {paymentStatus !== "PAID" &&
          !["CANCELLED", "COMPLETED", "PAID"].includes(orderStatus) && (
            <ActionButton
              disabled={loading}
              onClick={() => onCancelOrder(order)}
              danger
            >
              <FaTrash /> Cancel Order
            </ActionButton>
          )}

        {isAdmin && (
          <ActionButton
            disabled={loading}
            onClick={() => onDeleteOrder(order)}
            danger
          >
            <MdDeleteForever /> Delete Order
          </ActionButton>
        )}

        {canShowInvoice && (
          <ActionButton
            disabled={loading}
            onClick={() => onShowInvoice?.(order)}
            success
          >
            <FaReceipt /> Show Invoice
          </ActionButton>
        )}

        <ActionButton disabled={loading} onClick={() => onViewDetails(order)}>
          <FaEye /> Details
        </ActionButton>
        {order?.workflow !== "POST_BILLING" && order?.customerDetails?.phone && order?.trackingToken && (
          <ActionButton
            disabled={loading}
            onClick={() => handleShareTracking(order)}
            success
          >
            <FaWhatsapp /> WhatsApp
          </ActionButton>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ label, payment = false }) => {
  const value = normalizeStatus(label);

  const color =
    value === "PAID" || value === "COMPLETED" || value === "READY"
      ? "bg-green-600"
      : value === "PENDING" ||
          value === "PAYMENT_PENDING" ||
          value === "SENT_TO_KITCHEN"
        ? "bg-yellow-500 text-black"
        : value === "CANCELLED" || value === "REJECTED" || value === "REMOVED"
          ? "bg-red-600"
          : "bg-blue-600";

  return (
    <span
      className={`${color} text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold`}
    >
      {payment ? `PAYMENT: ${value || "N/A"}` : value || "N/A"}
    </span>
  );
};

const InfoBox = ({ title, value }) => (
  <div className="bg-[#1f1f1f] rounded-xl p-3 border border-[#333]">
    <p className="text-[#ababab] text-xs">{title}</p>
    <p className="font-semibold text-sm mt-1 break-words">{value}</p>
  </div>
);

const AmountBox = ({ title, value, highlight = false }) => (
  <div
    className={`rounded-xl p-3 border ${
      highlight
        ? "bg-[#f6b100] border-[#f6b100] text-black"
        : "bg-[#1f1f1f] border-[#333] text-white"
    }`}
  >
    <p className={`text-xs ${highlight ? "text-black/70" : "text-[#ababab]"}`}>
      {title}
    </p>
    <p className="font-bold mt-1 break-words">{value}</p>
  </div>
);

const SmallButton = ({ children, onClick, disabled, className = "" }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`${className} disabled:opacity-60 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1`}
  >
    {children}
  </button>
);

const ActionButton = ({
  children,
  onClick,
  disabled,
  success = false,
  danger = false,
}) => {
  let className = "bg-[#1f1f1f] hover:bg-[#333] border border-[#444]";

  if (success) className = "bg-green-600 hover:bg-green-700 border-green-600";
  if (danger) className = "bg-red-600 hover:bg-red-700 border-red-600";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${className} disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition`}
    >
      {children}
    </button>
  );
};

const areEqual = (prev, next) => {
  return (
    prev.order === next.order &&
    prev.now === next.now &&
    prev.userRole === next.userRole &&
    prev.servingItemIds === next.servingItemIds &&
    prev.loading === next.loading
  );
};

export default memo(OrderCard, areEqual);
