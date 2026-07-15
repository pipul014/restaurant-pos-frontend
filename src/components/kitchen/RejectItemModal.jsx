import { REJECTION_REASONS } from "./constants";
import { getOrderDisplayId } from "./helpers";

const RejectItemModal = ({
  data,
  reason,
  setReason,
  onClose,
  onSubmit,
  loading,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#262626] rounded-xl p-5 sm:p-6 w-full max-w-md border border-[#333]">
        <h2 className="text-white text-xl font-bold">Reject Item</h2>

        <p className="text-[#ababab] text-sm mt-1">
          {data.item.name} / {getOrderDisplayId(data.order)}
        </p>

        <label className="block text-[#ababab] text-sm mt-5 mb-2">
          Rejection Reason
        </label>

        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-3 outline-none border border-[#333] focus:border-red-500"
        >
          {REJECTION_REASONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-[#1f1f1f] text-white py-3 rounded-lg font-bold disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            disabled={loading}
            className="bg-red-500 text-white py-3 rounded-lg font-bold disabled:opacity-60"
          >
            {loading ? "Rejecting..." : "Reject Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectItemModal;
