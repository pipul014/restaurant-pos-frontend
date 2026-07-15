import SmallModal from "./SmallModal";
import { formatMoney } from "./helpers";

const DiscountModal = ({
  discountData,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  onClose,
  onSubmit,
  loading,
}) => {
  return (
    <SmallModal title="Discount" onClose={onClose}>
      <div className="bg-[#1f1f1f] rounded-xl p-4 border border-[#333]">
        <p className="text-[#ababab] text-sm">Category-wise Discount</p>

        <h3 className="text-green-400 text-xl font-black mt-1">
          -{formatMoney(discountData.categoryDiscountTotal)}
        </h3>

        <p className="text-[#777] text-xs mt-2">
          Auto applied from category settings.
        </p>
      </div>

      <div className="mt-4 bg-[#1f1f1f] rounded-xl p-4 border border-[#333]">
        <p className="text-[#ababab] text-sm mb-3">Total Amount Discount</p>

        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value)}
          className="w-full bg-[#262626] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#f6b100]"
        >
          <option value="NONE">No Discount</option>
          <option value="PERCENTAGE">Percentage (%)</option>
          <option value="FIXED">Fixed Amount (₹)</option>
        </select>

        <input
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          type="number"
          min="0"
          placeholder="Enter total discount"
          disabled={discountType === "NONE"}
          className="w-full mt-4 bg-[#262626] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#f6b100] disabled:opacity-50"
        />

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full mt-4 bg-[#f6b100] hover:bg-yellow-500 disabled:opacity-60 text-black py-3 rounded-xl font-bold"
        >
          Apply Total Discount
        </button>
      </div>
    </SmallModal>
  );
};

export default DiscountModal;
