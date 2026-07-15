import { displayStatus, normalizeStatus } from "../orders/statusMapper";

const StatusBadge = ({ status, small = false }) => {
  const normalized = normalizeStatus(status);

  const getClassName = () => {
    if (["READY", "SERVED"].includes(normalized))
      return "bg-green-500 text-white";
    if (["PREPARING", "ACCEPTED"].includes(normalized))
      return "bg-blue-500 text-white";
    if (normalized === "PARTIALLY_READY") return "bg-purple-500 text-white";
    if (normalized === "PARTIALLY_CANCELLED") return "bg-orange-500 text-white";
    if (["PAID", "COMPLETED"].includes(normalized))
      return "bg-emerald-500 text-white";
    if (["CANCELLED", "REJECTED", "REMOVED"].includes(normalized))
      return "bg-red-500 text-white";

    return "bg-yellow-400 text-black";
  };

  return (
    <span
      className={`${getClassName()} ${
        small ? "text-[10px] px-2 py-1" : "text-xs px-3 py-1"
      } rounded-full font-bold whitespace-nowrap`}
    >
      {displayStatus(normalized)}
    </span>
  );
};

export default StatusBadge;
