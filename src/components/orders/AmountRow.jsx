import { formatMoney } from "./helpers";

const AmountRow = ({ label, value, text, highlight, discount }) => (
  <div className="flex items-center justify-between gap-3">
    <p className="text-[#ababab] text-xs sm:text-sm">{label}</p>

    <p
      className={`text-xs sm:text-sm font-bold text-right ${
        highlight
          ? "text-[#f6b100]"
          : discount
            ? "text-green-400"
            : "text-white"
      }`}
    >
      {text ||
        `${discount && Number(value || 0) > 0 ? "-" : ""}${formatMoney(value)}`}
    </p>
  </div>
);

export default AmountRow;
