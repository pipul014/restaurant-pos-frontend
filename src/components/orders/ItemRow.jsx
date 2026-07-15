import React, { memo, useMemo } from "react";
import { formatMoney } from "./helpers";
import { normalizeStatus } from "./statusMapper";
import StatusBadge from "./StatusBadge";

const formatTimeLeft = (expectedReadyAt, now) => {
  if (!expectedReadyAt) return "";

  const diff = new Date(expectedReadyAt).getTime() - Number(now || Date.now());

  if (diff <= 0) return "Ready time reached";

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
};

const formatClock = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ItemRow = ({
  item,
  now,
  canModify,
  loading,
  serving,
  onServeItem,
  onCancelItem,
  onUpdateQuantity,
  onUpdateNote,
}) => {
  const status = normalizeStatus(item.status);

  const timeLeft = useMemo(() => {
    if (status !== "PREPARING") return "";
    return formatTimeLeft(item.expectedReadyAt, now);
  }, [status, item.expectedReadyAt, now]);

  const totalPrice = useMemo(() => {
    return Number(item.finalItemPrice || 0) * Number(item.quantity || 1);
  }, [item.finalItemPrice, item.quantity]);

  const canEditBeforeAcceptance = canModify && status === "PENDING";
  const canCancel =
    canModify && ["PENDING", "PREPARING", "READY"].includes(status);
  const canServe = canModify && status === "READY";

  const isBillable = ["READY", "SERVED", "PAID"].includes(status);
  const isExcluded = ["CANCELLED", "REJECTED", "REMOVED"].includes(status);

  return (
    <div className="bg-[#1f1f1f] border border-[#333] rounded-2xl p-3">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-white font-bold text-sm break-words">
              {item.name}
            </p>

            <StatusBadge status={status} small />
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-[#2b2b2b] text-[#ababab] text-[11px] px-2 py-1 rounded-full">
              Qty {item.quantity}
            </span>

            <span className="bg-[#2b2b2b] text-[#ababab] text-[11px] px-2 py-1 rounded-full">
              Rate {formatMoney(item.originalPrice)}
            </span>

            <span className="bg-[#2b2b2b] text-[#f6b100] text-[11px] px-2 py-1 rounded-full">
              Final {formatMoney(item.finalItemPrice)}
            </span>
          </div>

          {Number(item.categoryDiscountPercent || 0) > 0 && (
            <p className="text-green-400 text-xs mt-2">
              {item.categoryName}: {item.categoryDiscountPercent}% off
            </p>
          )}

          {item.notes && (
            <p className="text-yellow-400 text-xs mt-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2 py-1 break-words w-fit max-w-full">
              Note: {item.notes}
            </p>
          )}

          {status === "PREPARING" && item.expectedReadyAt && (
            <p className="text-blue-400 text-xs mt-2 bg-blue-500/10 rounded-full px-3 py-1 w-fit">
              Time Left: <span className="font-bold">{timeLeft}</span>
            </p>
          )}

          {status === "SERVED" && item.servedAt && (
            <p className="text-green-400 text-xs mt-2 bg-green-500/10 rounded-full px-3 py-1 w-fit">
              Served at{" "}
              <span className="font-bold">{formatClock(item.servedAt)}</span>
            </p>
          )}

          {status === "PAID" && item.paidAt && (
            <p className="text-emerald-400 text-xs mt-2 bg-emerald-500/10 rounded-full px-3 py-1 w-fit">
              Paid at{" "}
              <span className="font-bold">{formatClock(item.paidAt)}</span>
            </p>
          )}

          {item.rejectionReason && (
            <p className="text-red-400 text-xs mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1 break-words">
              Rejected: {item.rejectionReason}
            </p>
          )}

          {item.cancellationReason && (
            <p className="text-red-400 text-xs mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1 break-words">
              Cancelled: {item.cancellationReason}
            </p>
          )}
        </div>

        <div className="sm:text-right shrink-0">
          <p className="text-[#f6b100] text-sm font-black">
            {formatMoney(totalPrice)}
          </p>

          <p
            className={`text-[11px] mt-1 ${
              isBillable
                ? "text-green-400"
                : isExcluded
                  ? "text-red-400"
                  : "text-[#ababab]"
            }`}
          >
            {isBillable ? "Billable" : isExcluded ? "Not billable" : "Waiting"}
          </p>
        </div>
      </div>

      {canModify && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <button
            disabled={loading || serving || !canServe}
            onClick={onServeItem}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-[#333] disabled:text-[#777] text-white py-2 rounded-xl text-xs font-bold"
          >
            {serving ? "Serving..." : "Serve"}
          </button>

          <button
            disabled={loading || !canEditBeforeAcceptance}
            onClick={onUpdateQuantity}
            className="bg-[#333] hover:bg-[#444] disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold"
          >
            Qty
          </button>

          <button
            disabled={loading || !canEditBeforeAcceptance}
            onClick={onUpdateNote}
            className="bg-[#333] hover:bg-[#444] disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold"
          >
            Note
          </button>

          <button
            disabled={loading || !canCancel}
            onClick={onCancelItem}
            className="bg-red-500 hover:bg-red-600 disabled:bg-[#333] disabled:text-[#777] text-white py-2 rounded-xl text-xs font-bold"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(ItemRow);
