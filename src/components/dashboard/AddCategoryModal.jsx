import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { enqueueSnackbar } from "notistack";
import { addCategory } from "../../https";

const AddCategoryModal = ({ setIsCategoryModalOpen }) => {
  const [categoryData, setCategoryData] = useState({
    name: "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setCategoryData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCloseModal = () => {
    if (!loading) {
      setIsCategoryModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryData.name.trim()) {
      enqueueSnackbar("Category name is required", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await addCategory({
        name: categoryData.name.trim(),
      });

      enqueueSnackbar(res?.data?.message || "Category added successfully", {
        variant: "success",
      });

      setIsCategoryModalOpen(false);
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to add category",
        { variant: "error" },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="bg-[#262626] w-full max-w-[450px] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#333] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-[#f5f5f5] text-xl sm:text-2xl font-bold">
              Add Category
            </h1>

            <p className="text-[#ababab] text-sm mt-1">
              Create a menu category like Starter, Drinks, Main Course.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            disabled={loading}
            className="text-[#f5f5f5] hover:text-red-500 bg-[#1f1f1f] p-2 rounded-lg disabled:opacity-50"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6 sm:mt-8">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Category Name
            </label>

            <div className="bg-[#1f1f1f] rounded-lg px-4 py-3 sm:py-4 border border-transparent focus-within:border-yellow-400">
              <input
                type="text"
                name="name"
                value={categoryData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                className="bg-transparent w-full text-white focus:outline-none text-sm sm:text-base"
                autoComplete="off"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg mt-6 hover:bg-yellow-300 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Category"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddCategoryModal;
