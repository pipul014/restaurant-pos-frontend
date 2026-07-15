import React, { useState } from "react";
import {
  createStaff,
  deleteStaffUser,
  getStaffUsers,
  resetStaffPassword,
  adminChangeOwnPassword,
} from "../../https";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

const StaffManagement = () => {
  const queryClient = useQueryClient();

  const [staffData, setStaffData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "Cashier",
  });

  const [adminPasswordData, setAdminPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["staff-users"],
    queryFn: getStaffUsers,
  });

  const staffUsers = data?.data?.data || [];

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      enqueueSnackbar("Staff created successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["staff-users"] });

      setStaffData({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "Cashier",
      });
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to create", {
        variant: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffUser,
    onSuccess: () => {
      enqueueSnackbar("Staff deleted successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["staff-users"] });
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to delete", {
        variant: "error",
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetStaffPassword,
    onSuccess: () => {
      enqueueSnackbar("Password reset successfully", { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to reset", {
        variant: "error",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: adminChangeOwnPassword,
    onSuccess: () => {
      enqueueSnackbar("Admin password changed successfully", {
        variant: "success",
      });

      setAdminPasswordData({
        oldPassword: "",
        newPassword: "",
      });
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to change password",
        { variant: "error" },
      );
    },
  });

  const handleStaffChange = (e) => {
    const { name, value } = e.target;

    setStaffData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateStaff = (e) => {
    e.preventDefault();

    if (
      !staffData.name.trim() ||
      !staffData.email.trim() ||
      !staffData.password.trim()
    ) {
      enqueueSnackbar("Name, email and password are required", {
        variant: "warning",
      });
      return;
    }

    createMutation.mutate({
      ...staffData,
      name: staffData.name.trim(),
      email: staffData.email.trim(),
      phone: staffData.phone.trim(),
    });
  };

  const handleResetPassword = (staff) => {
    const password = prompt(`Enter new password for ${staff.name}`);

    if (!password) return;

    resetMutation.mutate({
      id: staff._id,
      password,
    });
  };

  const handleDeleteStaff = (staff) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${staff.name}?`,
    );

    if (!confirmDelete) return;

    deleteMutation.mutate(staff._id);
  };

  const handleChangeAdminPassword = (e) => {
    e.preventDefault();

    if (
      !adminPasswordData.oldPassword.trim() ||
      !adminPasswordData.newPassword.trim()
    ) {
      enqueueSnackbar("Old and new password are required", {
        variant: "warning",
      });
      return;
    }

    changePasswordMutation.mutate(adminPasswordData);
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#262626] p-4 sm:p-6 rounded-xl text-white">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold">Add Cashier / Cook</h2>
          <p className="text-[#ababab] text-sm mt-1">
            Create staff login access for cashier and kitchen users.
          </p>
        </div>

        <form
          onSubmit={handleCreateStaff}
          autoComplete="off"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <InputField
            name="name"
            placeholder="Name"
            value={staffData.name}
            onChange={handleStaffChange}
            autoComplete="off"
          />

          <InputField
            name="phone"
            placeholder="Phone"
            value={staffData.phone}
            onChange={handleStaffChange}
            autoComplete="off"
          />

          <InputField
            name="email"
            type="email"
            placeholder="Staff Email"
            value={staffData.email}
            onChange={handleStaffChange}
            autoComplete="new-email"
          />

          <InputField
            name="password"
            type="password"
            placeholder="Staff Password"
            value={staffData.password}
            onChange={handleStaffChange}
            autoComplete="new-password"
          />

          <select
            name="role"
            value={staffData.role}
            onChange={handleStaffChange}
            autoComplete="off"
            className="bg-[#1a1a1a] p-3 rounded-lg outline-none w-full border border-transparent focus:border-yellow-400"
          >
            <option value="Cashier">Cashier</option>
            <option value="Cook">Cook</option>
          </select>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-yellow-400 text-black font-bold rounded-lg p-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? "Adding..." : "Add Staff"}
          </button>
        </form>
      </section>

      <section className="bg-[#262626] p-4 sm:p-6 rounded-xl text-white">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold">
            All Cashiers & Cooks
          </h2>
          <p className="text-[#ababab] text-sm mt-1">
            Manage staff accounts, reset passwords, or remove users.
          </p>
        </div>

        {isLoading ? (
          <p className="text-[#ababab]">Loading staff...</p>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left min-w-[850px]">
                <thead className="bg-[#333]">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {staffUsers.length > 0 ? (
                    staffUsers.map((staff) => (
                      <tr key={staff._id} className="border-b border-gray-700">
                        <td className="p-4">{staff.name || "N/A"}</td>
                        <td className="p-4">{staff.phone || "N/A"}</td>
                        <td className="p-4">{staff.email || "N/A"}</td>
                        <td className="p-4">{staff.role || "N/A"}</td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleResetPassword(staff)}
                              disabled={resetMutation.isPending}
                              className="bg-blue-500 px-4 py-2 rounded-lg disabled:opacity-60"
                            >
                              Reset Password
                            </button>

                            <button
                              onClick={() => handleDeleteStaff(staff)}
                              disabled={deleteMutation.isPending}
                              className="bg-red-500 px-4 py-2 rounded-lg disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-6 text-gray-400">
                        No staff found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-3">
              {staffUsers.length > 0 ? (
                staffUsers.map((staff) => (
                  <div
                    key={staff._id}
                    className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]"
                  >
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white break-words">
                          {staff.name || "N/A"}
                        </h3>

                        <p className="text-[#ababab] text-sm break-all mt-1">
                          {staff.email || "N/A"}
                        </p>
                      </div>

                      <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-xs h-fit">
                        {staff.role || "N/A"}
                      </span>
                    </div>

                    <p className="text-[#ababab] text-sm mt-3">
                      Phone: {staff.phone || "N/A"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() => handleResetPassword(staff)}
                        disabled={resetMutation.isPending}
                        className="bg-blue-500 px-4 py-2 rounded-lg disabled:opacity-60"
                      >
                        Reset Password
                      </button>

                      <button
                        onClick={() => handleDeleteStaff(staff)}
                        disabled={deleteMutation.isPending}
                        className="bg-red-500 px-4 py-2 rounded-lg disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-gray-400 bg-[#1a1a1a] rounded-xl">
                  No staff found
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <section className="bg-[#262626] p-4 sm:p-6 rounded-xl text-white">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold">
            Admin Change Own Password
          </h2>
          <p className="text-[#ababab] text-sm mt-1">
            Update your admin account password securely.
          </p>
        </div>

        <form
          onSubmit={handleChangeAdminPassword}
          autoComplete="off"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <InputField
            type="password"
            name="oldPassword"
            placeholder="Old Password"
            value={adminPasswordData.oldPassword}
            onChange={(e) =>
              setAdminPasswordData((prev) => ({
                ...prev,
                oldPassword: e.target.value,
              }))
            }
            autoComplete="current-password"
          />

          <InputField
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={adminPasswordData.newPassword}
            onChange={(e) =>
              setAdminPasswordData((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="bg-yellow-400 text-black font-bold rounded-lg p-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {changePasswordMutation.isPending
              ? "Changing..."
              : "Change Password"}
          </button>
        </form>
      </section>
    </div>
  );
};

const InputField = ({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete = "off",
}) => {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className="bg-[#1a1a1a] p-3 rounded-lg outline-none w-full border border-transparent focus:border-yellow-400"
    />
  );
};

export default StaffManagement;
