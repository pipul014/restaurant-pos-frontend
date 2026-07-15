import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation } from "@tanstack/react-query";
import { addTable } from "../../https";
import { enqueueSnackbar } from "notistack";

const Modal = ({ setIsTableModalOpen }) => {
  const [tableData, setTableData] = useState({
    tableNo: "",
    seats: "",
  });

  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),

    onSuccess: (res) => {
      enqueueSnackbar(res?.data?.message || "Table added successfully", {
        variant: "success",
      });

      setIsTableModalOpen(false);
    },

    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to add table", {
        variant: "error",
      });
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setTableData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    if (!tableMutation.isPending) {
      setIsTableModalOpen(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const tableNo = Number(tableData.tableNo);
    const seats = Number(tableData.seats);

    if (!tableNo || tableNo <= 0) {
      enqueueSnackbar("Valid table number is required", {
        variant: "warning",
      });
      return;
    }

    if (!seats || seats <= 0) {
      enqueueSnackbar("Valid number of seats is required", {
        variant: "warning",
      });
      return;
    }

    tableMutation.mutate({
      tableNo,
      seats,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="bg-[#262626] w-full max-w-[420px] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#333] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-[#f5f5f5] text-xl sm:text-2xl font-bold">
              Add Table
            </h2>

            <p className="text-[#ababab] text-sm mt-1">
              Create a new restaurant table with seating capacity.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            disabled={tableMutation.isPending}
            className="text-[#f5f5f5] hover:text-red-500 bg-[#1f1f1f] p-2 rounded-lg disabled:opacity-50 shrink-0"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6 sm:mt-8">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Table Number
            </label>

            <div className="flex items-center rounded-lg px-4 py-3 sm:py-4 bg-[#1f1f1f] border border-transparent focus-within:border-yellow-400">
              <input
                type="number"
                name="tableNo"
                value={tableData.tableNo}
                onChange={handleInputChange}
                placeholder="Enter table number"
                min="1"
                className="bg-transparent w-full text-white focus:outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Number of Seats
            </label>

            <div className="flex items-center rounded-lg px-4 py-3 sm:py-4 bg-[#1f1f1f] border border-transparent focus-within:border-yellow-400">
              <input
                type="number"
                name="seats"
                value={tableData.seats}
                onChange={handleInputChange}
                placeholder="Enter number of seats"
                min="1"
                className="bg-transparent w-full text-white focus:outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={tableMutation.isPending}
            className="w-full rounded-lg py-3 sm:py-4 text-base sm:text-lg bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {tableMutation.isPending ? "Adding..." : "Add Table"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;
