import SmallModal from "./SmallModal";
import { CANCELLATION_REASONS } from "./constants";

const CancelModal = ({
  cancelData,
  cancelReason,
  setCancelReason,
  onClose,
  onSubmit,
  loading,
}) => {
  return (
    <SmallModal title="Cancel" onClose={onClose}>
      <p className="text-[#ababab] text-sm">
        {cancelData.type === "order"
          ? `Cancel order ${cancelData.order.orderNumber || cancelData.order.invoiceNo}?`
          : `Cancel item ${cancelData.item.name}?`}
      </p>

      <label className="block text-[#ababab] text-sm mt-4 mb-2">
        Cancellation Reason
      </label>

      <select
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
        className="w-full bg-[#1f1f1f] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-red-500"
      >
        {CANCELLATION_REASONS.map((reason) => (
          <option key={reason} value={reason}>
            {reason}
          </option>
        ))}
      </select>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full mt-4 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold"
      >
        Confirm Cancel
      </button>
    </SmallModal>
  );
};

export default CancelModal;
