import React, { useState } from "react";
import { login } from "../https";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      enqueueSnackbar("Email and password are required", {
        variant: "warning",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { data } = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const user = data?.data;

      dispatch(setUser(user));

      enqueueSnackbar("Login successful", {
        variant: "success",
      });

      if (user?.role === "Cook") {
        navigate("/cook-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Login failed", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#1f1f1f] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[430px]">
        <form
          onSubmit={handleLogin}
          className="bg-[#262626] rounded-2xl p-5 sm:p-8 shadow-xl border border-[#333]"
        >
          <div className="text-center mb-6">
            <h1 className="text-white text-2xl sm:text-3xl font-bold">
              POS Login
            </h1>

            <p className="text-[#ababab] text-sm mt-2">
              Sign in to continue to restaurant POS
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[#ababab] text-sm font-medium mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full p-3 sm:p-4 rounded-lg bg-[#1a1a1a] text-white outline-none border border-transparent focus:border-yellow-400 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-[#ababab] text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full p-3 sm:p-4 rounded-lg bg-[#1a1a1a] text-white outline-none border border-transparent focus:border-yellow-400 text-sm sm:text-base"
              />
            </div>
          </div>

          <p className="text-[#ababab] text-xs sm:text-sm mt-4 leading-relaxed">
            Cashier/Cook forgot password? Contact Admin.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold p-3 sm:p-4 rounded-lg mt-6 transition"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Auth;
