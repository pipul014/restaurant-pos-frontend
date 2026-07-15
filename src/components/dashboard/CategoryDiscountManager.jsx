import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../https";

const emptyForm = {
  name: "",
  discountPercent: "",
};

const CategoryDiscountManager = () => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["categories", search],
    queryFn: () => getCategories({ search, active: "all" }),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const categories = data?.data?.data || [];
  const isEditMode = Boolean(editId);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditId(null);
  };

  const refreshCategories = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["dishes"] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (editId) {
        return updateCategory({
          categoryId: editId,
          ...payload,
        });
      }

      return addCategory(payload);
    },

    onSuccess: () => {
      enqueueSnackbar(
        isEditMode
          ? "Category updated successfully"
          : "Category added successfully",
        { variant: "success" },
      );

      resetForm();
      refreshCategories();
    },

    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to save category",
        { variant: "error" },
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,

    onSuccess: () => {
      enqueueSnackbar("Category deleted successfully", { variant: "success" });
      refreshCategories();
    },

    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to delete category",
        { variant: "error" },
      );
    },
  });

  const clearDiscountMutation = useMutation({
    mutationFn: (category) =>
      updateCategory({
        categoryId: category._id,
        name: category.name,
        discountPercent: 0,
      }),

    onSuccess: () => {
      enqueueSnackbar("Category discount cleared", { variant: "success" });
      refreshCategories();
    },

    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to clear discount",
        { variant: "error" },
      );
    },
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEdit = (category) => {
    setEditId(category._id);

    setFormData({
      name: category.name || "",
      discountPercent: String(category.discountPercent || 0),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const discountPercent = Number(formData.discountPercent || 0);

    if (!name) {
      enqueueSnackbar("Category name is required", { variant: "warning" });
      return;
    }

    if (discountPercent < 0 || discountPercent > 100) {
      enqueueSnackbar("Discount must be between 0 and 100", {
        variant: "warning",
      });
      return;
    }

    saveMutation.mutate({
      name,
      discountPercent,
    });
  };

  const handleDelete = (category) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);

    if (!confirmed) return;

    deleteMutation.mutate(category._id);
  };

  const handleClearDiscount = (category) => {
    if (Number(category.discountPercent || 0) <= 0) {
      enqueueSnackbar("This category already has no discount", {
        variant: "info",
      });
      return;
    }

    clearDiscountMutation.mutate(category);
  };

  return (
    <div className="bg-[#262626] border border-[#333] rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-white text-xl font-bold">
            Category Discount Manager
          </h2>

          <p className="text-[#ababab] text-sm mt-1">
            Add, update, clear, delete and view category-wise discounts.
          </p>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category..."
          className="w-full lg:max-w-xs bg-[#1f1f1f] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#f6b100]"
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3 mb-6"
      >
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Category name e.g. Starter"
          className="bg-[#1f1f1f] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#f6b100]"
        />

        <input
          name="discountPercent"
          value={formData.discountPercent}
          onChange={handleChange}
          type="number"
          min="0"
          max="100"
          placeholder="Discount %"
          className="bg-[#1f1f1f] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#f6b100]"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-[#f6b100] hover:bg-yellow-500 disabled:opacity-60 text-black px-5 py-3 rounded-xl font-bold"
          >
            {saveMutation.isPending
              ? "Saving..."
              : isEditMode
                ? "Update"
                : "Add"}
          </button>

          {isEditMode && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-[#333] hover:bg-[#444] text-white px-5 py-3 rounded-xl font-bold"
            >
              Clear Form
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <div className="bg-[#1f1f1f] rounded-xl p-5 text-white">
          Loading categories...
        </div>
      ) : sortedCategories.length === 0 ? (
        <div className="bg-[#1f1f1f] rounded-xl p-5 text-[#ababab]">
          No categories found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-[#ababab] border-b border-[#333]">
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedCategories.map((category) => (
                <tr
                  key={category._id}
                  className="border-b border-[#333] text-white"
                >
                  <td className="py-3 px-3 font-bold">{category.name}</td>

                  <td className="py-3 px-3">
                    {Number(category.discountPercent || 0) > 0 ? (
                      <span className="text-green-400 font-bold">
                        {Number(category.discountPercent || 0)}% OFF
                      </span>
                    ) : (
                      <span className="text-[#ababab] font-semibold">
                        No Discount
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    {category.isActive ? (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleClearDiscount(category)}
                        disabled={clearDiscountMutation.isPending}
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-3 py-2 rounded-lg text-xs font-bold"
                      >
                        Clear Discount
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={deleteMutation.isPending}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-3 py-2 rounded-lg text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryDiscountManager;
