//fast
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: (res) => {
      const user = res?.data?.data;

      if (!user) {
        enqueueSnackbar("Login response invalid", { variant: "error" });
        return;
      }

      const { _id, name, email, phone, role } = user;

      dispatch(setUser({ _id, name, email, phone, role }));

      enqueueSnackbar("Login successful", { variant: "success" });

      if (role === "Cook") {
        navigate("/cook-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    },

    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Login failed", {
        variant: "error",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      enqueueSnackbar("Email and password are required", {
        variant: "warning",
      });
      return;
    }

    loginMutation.mutate({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Employee Email
          </label>

          <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter employee email"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Password
          </label>

          <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold disabled:opacity-60"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default Login;
