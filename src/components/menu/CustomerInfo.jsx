//final kds
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { formatDate, getAvatarName } from "../../utils";

const CustomerInfo = () => {
  const customerData = useSelector((state) => state.customer);

  const currentDate = useMemo(() => new Date(), []);

  const customerName = customerData.customerName?.trim() || "Walk-In Customer";

  const getOrderTypeLabel = () => {
    if (customerData.orderType === "dinein") {
      return `Dine-In${
        customerData.table?.tableNo
          ? ` / Table ${customerData.table.tableNo}`
          : ""
      }`;
    }

    if (customerData.orderType === "takeaway") {
      return "Takeaway";
    }

    return "Walk-In";
  };

  return (
    <div className="px-4 sm:px-5 py-4 border-b border-[#333]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-[#f5f5f5] text-base sm:text-lg font-semibold tracking-wide break-words">
            {customerName}
          </h1>

          <p className="text-xs sm:text-sm text-[#ababab] font-medium mt-1 break-words">
            #{customerData.orderId || "N/A"} / {getOrderTypeLabel()}
          </p>

          {customerData.customerPhone && (
            <p className="text-xs sm:text-sm text-[#ababab] font-medium mt-1 break-words">
              Phone: {customerData.customerPhone}
            </p>
          )}

          {customerData.orderType === "dinein" && (
            <p className="text-xs sm:text-sm text-[#ababab] font-medium mt-1">
              Guests: {customerData.guests || 1}
            </p>
          )}

          {customerData.systemNotes && (
            <div className="mt-2 bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2">
              <p className="text-xs text-[#f6b100] font-semibold">
                System Notes
              </p>

              <p className="text-xs sm:text-sm text-[#ababab] mt-1 break-words">
                {customerData.systemNotes}
              </p>
            </div>
          )}

          <p className="text-xs sm:text-sm text-[#ababab] font-medium mt-2">
            {formatDate(currentDate)}
          </p>
        </div>

        <div className="bg-[#f6b100] text-black w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shrink-0">
          {getAvatarName(customerName) || "WC"}
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
