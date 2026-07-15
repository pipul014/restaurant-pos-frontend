import React, { memo, useMemo } from "react";
import { normalizeStatus, displayStatus } from "./statusMapper";

const STATUS_COLORS = {
  CREATED: "bg-slate-500/20 text-slate-300",

  SENT_TO_KITCHEN: "bg-blue-500/20 text-blue-400",

  PREPARING: "bg-orange-500/20 text-orange-400",

  PARTIALLY_READY: "bg-yellow-500/20 text-yellow-400",

  READY: "bg-green-500/20 text-green-400",

  PAYMENT_PENDING: "bg-purple-500/20 text-purple-400",

  PAID: "bg-emerald-500/20 text-emerald-400",

  COMPLETED: "bg-green-600/20 text-green-300",

  PARTIALLY_CANCELLED: "bg-red-500/20 text-red-300",

  CANCELLED: "bg-red-600/20 text-red-400",

  REJECTED: "bg-red-700/20 text-red-400",

  PENDING: "bg-slate-500/20 text-slate-300",

  ACCEPTED: "bg-cyan-500/20 text-cyan-400",

  SERVED: "bg-indigo-500/20 text-indigo-300",

  REMOVED: "bg-gray-500/20 text-gray-300",
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = useMemo(() => normalizeStatus(status), [status]);

  const badgeClass = useMemo(
    () => STATUS_COLORS[normalizedStatus] || "bg-gray-500/20 text-gray-300",
    [normalizedStatus],
  );

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${badgeClass}`}
    >
      {displayStatus(normalizedStatus)}
    </span>
  );
};

export default memo(StatusBadge);
