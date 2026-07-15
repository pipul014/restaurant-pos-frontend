import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable as updateCustomerTable } from "../../redux/slices/customerSlice";
import { FaLongArrowAltRight } from "react-icons/fa";
import { updateTable } from "../../https";
import { enqueueSnackbar } from "notistack";

const TableCard = ({ id, name, status, initials, seats }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isBooking, setIsBooking] = useState(false);

  const isBooked = status === "Booked";

  const handleClick = async () => {
    if (isBooked || isBooking) return;

    try {
      setIsBooking(true);

      await updateTable({
        tableId: id,
        status: "Booked",
        orderId: null,
      });

      dispatch(
        updateCustomerTable({
          table: {
            tableId: id,
            tableNo: name,
          },
        }),
      );

      navigate("/menu");
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to book table",
        { variant: "error" },
      );
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`w-full bg-[#262626] border border-[#333] p-4 sm:p-5 rounded-xl transition ${
        isBooked || isBooking
          ? "cursor-not-allowed opacity-80"
          : "cursor-pointer hover:bg-[#2c2c2c] active:scale-[0.98]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-[#f5f5f5] text-lg sm:text-xl font-semibold flex items-center flex-wrap gap-2">
          Table
          <FaLongArrowAltRight className="text-[#ababab]" />
          <span>{name}</span>
        </h1>

        <span
          className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap ${
            isBooked || isBooking
              ? "text-green-400 bg-green-500/20"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {isBooking ? "Booking..." : status || "Available"}
        </span>
      </div>

      <div className="flex items-center justify-center my-6 sm:my-8">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold"
          style={{
            backgroundColor: initials ? getBgColor() : "#1f1f1f",
          }}
        >
          {getAvatarName(initials) || "N/A"}
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#1f1f1f] rounded-lg px-3 py-2">
        <p className="text-[#ababab] text-xs sm:text-sm">Seats</p>
        <p className="text-[#f5f5f5] font-semibold">{seats || 0}</p>
      </div>
    </div>
  );
};

export default TableCard;
