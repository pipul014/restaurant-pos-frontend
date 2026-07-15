//update time
import { formatDateAndTime } from "../../utils";

import {
  getItemsByStatus,
  getKitchenProgress,
  getOrderDisplayId,
  getRejectedCancelledItems,
  isKitchenOrderUrgent,
  safeText,
  sortKitchenItems,
} from "./helpers";

import KitchenItemCard from "./KitchenItemCard";
import MiniStatus from "./MiniStatus";
import StatusBadge from "./StatusBadge";

const KitchenOrderCard = ({
  order,
  activeTab,
  actionItemId,
  actionType,
  onAcceptItem,
  onRejectItem,
  onMarkReady,
  onChangeTime,
}) => {
  const items = order?.items || [];

  const pendingItems = getItemsByStatus(items, "PENDING");
  const preparingItems = getItemsByStatus(items, "PREPARING");
  const readyItems = getItemsByStatus(items, "READY");
  const rejectedCancelledItems = getRejectedCancelledItems(items);

  const visibleItems =
    activeTab === "Pending"
      ? pendingItems
      : activeTab === "Preparing"
        ? preparingItems
        : activeTab === "Ready"
          ? readyItems
          : rejectedCancelledItems;

  const sortedVisibleItems = sortKitchenItems(visibleItems);
  const progress = getKitchenProgress(items);
  const isUrgent = isKitchenOrderUrgent(order);

  const activeItems = items.filter(
    (item) =>
      !["CANCELLED", "REJECTED", "REMOVED"].includes(
        String(item.status || "").toUpperCase(),
      ),
  );

  const readyActiveItems = activeItems.filter((item) =>
    ["READY", "SERVED", "PAID"].includes(
      String(item.status || "").toUpperCase(),
    ),
  );

  return (
    <div
      className={`flex flex-col rounded-3xl border p-4 sm:p-5 shadow-sm transition ${
        isUrgent ? "border-red-500 bg-red-500/5" : "border-[#333] bg-[#262626]"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-all text-xl font-black text-white">
              {getOrderDisplayId(order)}
            </h2>

            {isUrgent && (
              <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-black text-white">
                URGENT
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-[#ababab]">
            {formatDateAndTime(order?.createdAt)}
          </p>
        </div>

        <StatusBadge status={order?.orderStatus} />
      </div>

      <div className="mt-4 rounded-3xl border border-[#333] bg-[#1a1a1a] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-bold text-white">
              {safeText(order?.customerDetails?.name, "Walk-In Customer")}
            </p>

            <p className="mt-1 text-sm text-[#ababab]">
              Phone: {safeText(order?.customerDetails?.phone)}
            </p>

            <p className="mt-1 text-sm text-[#ababab]">
              {order?.orderType === "dinein"
                ? `Dine-In • Table ${order?.table?.tableNo || "N/A"}`
                : order?.orderType === "takeaway"
                  ? "Takeaway"
                  : "Walk-In"}
            </p>
          </div>

          <div className="rounded-2xl bg-[#262626] px-4 py-3 text-center">
            <p className="text-2xl font-black text-green-400">
              {readyActiveItems.length}/{activeItems.length || 0}
            </p>
            <p className="text-[10px] font-black uppercase tracking-wide text-[#ababab]">
              Ready
            </p>
          </div>
        </div>

        {order?.customerDetails?.systemNotes && (
          <div className="mt-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3">
            <p className="text-xs font-black text-yellow-400">System Notes</p>

            <p className="mt-1 break-words text-sm text-[#e5e5e5]">
              {order.customerDetails.systemNotes}
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
          <MiniStatus
            label="Pending"
            count={pendingItems.length}
            className="bg-yellow-500/20 text-yellow-400"
          />

          <MiniStatus
            label="Preparing"
            count={preparingItems.length}
            className="bg-blue-500/20 text-blue-400"
          />

          <MiniStatus
            label="Ready"
            count={readyItems.length}
            className="bg-green-500/20 text-green-400"
          />

          <MiniStatus
            label="Cancel"
            count={rejectedCancelledItems.length}
            className="bg-red-500/20 text-red-400"
          />
        </div>

        <div className="mt-4">
          <div className="h-2.5 overflow-hidden rounded-full bg-[#333]">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <p className="font-bold text-[#ababab]">Kitchen Progress</p>
            <p className="font-black text-white">{progress}%</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-black text-white">{activeTab} Items</h3>

          <span className="rounded-full bg-[#1a1a1a] px-3 py-1 text-xs font-black text-[#ababab]">
            {sortedVisibleItems.length} item
            {sortedVisibleItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {sortedVisibleItems.length > 0 ? (
            sortedVisibleItems.map((item) => (
              <KitchenItemCard
                key={item._id}
                item={item}
                activeTab={activeTab}
                actionType={actionItemId === item._id ? actionType : ""}
                onAcceptItem={() => onAcceptItem(item)}
                onRejectItem={() => onRejectItem(item)}
                onMarkReady={() => onMarkReady(item)}
                onChangeTime={() => onChangeTime?.(item)}
              />
            ))
          ) : (
            <p className="rounded-2xl bg-[#1a1a1a] p-5 text-center text-[#ababab]">
              No items found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenOrderCard;
