import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { enqueueSnackbar } from "notistack";
import { addDish, getCategories } from "../../https";

const AddDishModal = ({ setIsDishModalOpen }) => {
  const [dishData, setDishData] = useState({
    name: "",
    price: "",
    category: "",
    dishType: "Vegetarian",
    description: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setDishData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    if (!loading) {
      setIsDishModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);

        const res = await getCategories();
        setCategories(res?.data?.data || []);
      } catch (error) {
        enqueueSnackbar("Failed to load categories", {
          variant: "error",
        });
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dishData.name.trim()) {
      enqueueSnackbar("Dish name is required", {
        variant: "warning",
      });
      return;
    }

    if (!dishData.price || Number(dishData.price) <= 0) {
      enqueueSnackbar("Valid price is required", {
        variant: "warning",
      });
      return;
    }

    if (!dishData.category) {
      enqueueSnackbar("Please select category", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: dishData.name.trim(),
        price: Number(dishData.price),
        category: dishData.category,
        dishType: dishData.dishType,
        description: dishData.description.trim(),
      };

      const res = await addDish(payload);

      enqueueSnackbar(res?.data?.message || "Dish added successfully", {
        variant: "success",
      });

      setIsDishModalOpen(false);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to add dish", {
        variant: "error",
      });
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
        className="bg-[#262626] w-full max-w-[560px] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#333] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-white text-xl sm:text-2xl font-bold">
              Add Dish
            </h1>

            <p className="text-[#ababab] text-sm mt-1">
              Create a new dish and link it with a menu category.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            disabled={loading}
            className="text-white hover:text-red-500 bg-[#1f1f1f] p-2 rounded-lg disabled:opacity-50 shrink-0"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6 sm:mt-8">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Dish Name
            </label>

            <div className="bg-[#1f1f1f] rounded-lg px-4 py-3 sm:py-4 border border-transparent focus-within:border-yellow-400">
              <input
                type="text"
                name="name"
                value={dishData.name}
                onChange={handleInputChange}
                placeholder="Enter dish name"
                className="bg-transparent w-full text-white focus:outline-none text-sm sm:text-base"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[#ababab] mb-2 text-sm font-medium">
                Price
              </label>

              <div className="bg-[#1f1f1f] rounded-lg px-4 py-3 sm:py-4 border border-transparent focus-within:border-yellow-400">
                <input
                  type="number"
                  name="price"
                  value={dishData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="1"
                  className="bg-transparent w-full text-white focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#ababab] mb-2 text-sm font-medium">
                Category
              </label>

              <div className="bg-[#1f1f1f] rounded-lg px-4 py-3 sm:py-4 border border-transparent focus-within:border-yellow-400">
                <select
                  name="category"
                  value={dishData.category}
                  onChange={handleInputChange}
                  disabled={categoryLoading}
                  className="bg-[#1f1f1f] w-full text-white focus:outline-none text-sm sm:text-base disabled:opacity-60"
                >
                  <option value="">
                    {categoryLoading ? "Loading..." : "Select Category"}
                  </option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Dish Type
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["Vegetarian", "Non-Vegetarian"].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() =>
                    setDishData((prev) => ({
                      ...prev,
                      dishType: type,
                    }))
                  }
                  className={`py-3 rounded-lg font-semibold transition ${
                    dishData.dishType === type
                      ? "bg-yellow-400 text-black"
                      : "bg-[#1f1f1f] text-white hover:bg-[#333]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Description
            </label>

            <div className="bg-[#1f1f1f] rounded-lg px-4 py-3 sm:py-4 border border-transparent focus-within:border-yellow-400">
              <textarea
                rows={4}
                name="description"
                value={dishData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                className="bg-transparent w-full text-white resize-none focus:outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || categoryLoading}
            className="w-full bg-yellow-400 text-black py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-yellow-300 transition"
          >
            {loading ? "Adding..." : "Add Dish"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddDishModal;
