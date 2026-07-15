//update time
import useCountdown from "../../hooks/useCountdown";
import StatusBadge from "./StatusBadge";
import { normalizeStatus } from "../orders/statusMapper";

const isOverdue = (expectedReadyAt) => {
  if (!expectedReadyAt) return false;
  const end = new Date(expectedReadyAt).getTime();
  return Number.isFinite(end) && Date.now() > end;
};

const KitchenItemCard = ({
  item,
  activeTab,
  actionType,
  onAcceptItem,
  onRejectItem,
  onMarkReady,
  onChangeTime,
}) => {
  const status = normalizeStatus(item?.status);
  const timeLeft = useCountdown(item?.expectedReadyAt);
  const overdue = status === "PREPARING" && isOverdue(item?.expectedReadyAt);

  const isLoading = Boolean(actionType);
  const canAcceptOrReject = activeTab === "Pending" && status === "PENDING";
  const canMarkReady = activeTab === "Preparing" && status === "PREPARING";

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        overdue
          ? "bg-red-500/10 border-red-500 shadow-lg shadow-red-500/10"
          : "bg-[#1a1a1a] border-[#333]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-white text-base font-black break-words">
              {item?.name || "Unnamed Item"}
            </h4>

            <StatusBadge status={status} small />

            {overdue && (
              <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-black text-white">
                OVERDUE
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#262626] px-3 py-1 text-xs font-bold text-[#ababab]">
              Qty: {item?.quantity || 1}
            </span>

            <span className="rounded-full bg-[#262626] px-3 py-1 text-xs font-bold text-[#ababab]">
              Est: {item?.estimatedPreparationMinutes || 10} min
            </span>

            {item?.additionGroupId && (
              <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
                Added Later
              </span>
            )}
          </div>

          {item?.notes && (
            <p className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400 break-words">
              Note: {item.notes}
            </p>
          )}

          {status === "PREPARING" && item?.expectedReadyAt && (
            <div
              className={`mt-4 w-full rounded-2xl border px-4 py-3 ${
                overdue
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wide">
                    {overdue ? "Time Over" : "Time Left"}
                  </p>

                  <p className="mt-1 text-2xl font-black leading-none">
                    {timeLeft}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-wide opacity-80">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-black">
                    {overdue ? "Needs Update" : "Cooking"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {item?.rejectionReason && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-xs font-black text-red-400">REJECTED</p>
              <p className="mt-1 break-words text-xs text-red-300">
                {item.rejectionReason}
              </p>
            </div>
          )}

          {item?.cancellationReason && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-xs font-black text-red-400">CANCELLED</p>
              <p className="mt-1 break-words text-xs text-red-300">
                {item.cancellationReason}
              </p>
            </div>
          )}
        </div>
      </div>

      {canAcceptOrReject && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onRejectItem}
            className="rounded-2xl bg-red-500 py-3 text-sm font-black text-white active:scale-[0.98] disabled:opacity-60"
          >
            {actionType === "reject" ? "Rejecting..." : "Reject"}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onAcceptItem}
            className="rounded-2xl bg-yellow-400 py-3 text-sm font-black text-black active:scale-[0.98] disabled:opacity-60"
          >
            {actionType === "accept" ? "Accepting..." : "Accept"}
          </button>
        </div>
      )}

      {canMarkReady && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onChangeTime}
            className="rounded-2xl border border-[#444] bg-[#262626] py-3 text-sm font-black text-white active:scale-[0.98] disabled:opacity-60"
          >
            {actionType === "change-time" ? "Updating..." : "Change Time"}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onMarkReady}
            className="rounded-2xl bg-green-500 py-3 text-sm font-black text-white active:scale-[0.98] disabled:opacity-60"
          >
            {actionType === "ready" ? "Marking..." : "Mark Ready"}
          </button>
        </div>
      )}

      {activeTab === "Ready" && status === "READY" && (
        <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 py-3 text-center text-sm font-black text-green-400">
          Waiting for cashier to serve
        </div>
      )}
    </div>
  );
};

export default KitchenItemCard;
