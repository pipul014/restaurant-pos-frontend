import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaHome, FaPhoneAlt, FaUser } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Modal from "./Modal";
import { setCustomer } from "../../redux/slices/customerSlice";
import { getCategories, getDishes, searchCustomers } from "../../https";

const navItems = [
  {
    label: "Home",
    path: "/",
    icon: <FaHome size={20} />,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: <MdOutlineReorder size={21} />,
  },
  {
    label: "Tables",
    path: "/tables",
    icon: <MdTableBar size={21} />,
  },
  {
    label: "More",
    path: "/more",
    icon: <CiCircleMore size={22} />,
  },
];

const SYSTEM_NOTE_OPTIONS = [
  "",
  "Less Spicy",
  "Medium Spicy",
  "Extra Spicy",
  "No Onion",
  "No Garlic",
  "Less Oil",
  "Extra Cheese",
  "Less Salt",
  "Extra Salt",
  "No Sugar",
  "Birthday Celebration",
  "Anniversary Celebration",
  "Parcel / Takeaway Packing",
  "VIP Customer",
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const suggestionRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [orderType, setOrderType] = useState("walkin");
  const [guestCount, setGuestCount] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [customerSearch, setCustomerSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isActive = (path) => location.pathname === path;

  const isCreateDisabled =
    location.pathname === "/tables" ||
    location.pathname === "/menu" ||
    location.pathname === "/cook-dashboard";

  const searchQuery = useMemo(() => {
    return customerSearch.trim();
  }, [customerSearch]);

  const { data: customerSearchData, isFetching: isSearchingCustomer } =
    useQuery({
      queryKey: ["customer-search", searchQuery],
      queryFn: () => searchCustomers(searchQuery),
      enabled: isModalOpen && searchQuery.length >= 2,
      staleTime: 30000,
    });

  const customerSuggestions = useMemo(() => {
    return customerSearchData?.data?.data || [];
  }, [customerSearchData]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const resetForm = () => {
    setName("");
    setPhone("");
    setNotes("");
    setGuestCount(1);
    setOrderType("walkin");
    setCustomerSearch("");
    setShowSuggestions(false);
  };

  const handleClose = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleNameChange = (value) => {
    setName(value);
    setCustomerSearch(value);
    setShowSuggestions(value.trim().length >= 2);
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    setCustomerSearch(value);
    setShowSuggestions(value.trim().length >= 2);
  };

  const handleSelectCustomer = (customer) => {
    setName(customer.name || "");
    setPhone(customer.phone || "");
    setCustomerSearch("");
    setShowSuggestions(false);

    enqueueSnackbar("Customer details auto-filled", {
      variant: "success",
    });
  };

  const handleCreateOrder = async () => {
    const finalOrderType = orderType || "walkin";

    if (!["walkin", "takeaway", "dinein"].includes(finalOrderType)) {
      enqueueSnackbar("Please select valid order type", {
        variant: "warning",
      });
      return;
    }

    dispatch(
      setCustomer({
        name: name.trim(),
        phone: phone.trim(),
        systemNotes: notes.trim(),
        guests: guestCount || 1,
        orderType: finalOrderType,
      }),
    );

    resetForm();
    setIsModalOpen(false);

    if (finalOrderType === "dinein") {
      navigate("/tables");
      return;
    }

    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: () => getCategories(),
      staleTime: 5 * 60 * 1000,
    });

    queryClient.prefetchQuery({
      queryKey: ["dishes", {}],
      queryFn: () => getDishes({}),
      staleTime: 5 * 60 * 1000,
    });

    navigate("/menu");
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#262626]/95 backdrop-blur border-t border-[#333]">
        <div className="relative mx-auto flex h-16 sm:h-20 max-w-[1600px] items-center justify-around px-2 sm:px-4">
          {navItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex min-w-0 flex-1 flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all ${
                index === 1 ? "mr-8 sm:mr-14" : ""
              } ${index === 2 ? "ml-8 sm:ml-14" : ""} ${
                isActive(item.path)
                  ? "bg-[#343434] text-[#f5f5f5]"
                  : "text-[#ababab] hover:bg-[#303030] hover:text-white"
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}

          <button
            disabled={isCreateDisabled}
            onClick={() => setIsModalOpen(true)}
            className={`absolute left-1/2 -translate-x-1/2 -top-6 sm:-top-8 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-4 border-[#1f1f1f] bg-[#F6B100] text-white shadow-xl transition-all ${
              isCreateDisabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:scale-105 active:scale-95"
            }`}
            aria-label="Create order"
          >
            <BiSolidDish className="text-4xl sm:text-5xl" />
          </button>
        </div>
      </nav>

      <Modal isOpen={isModalOpen} onClose={handleClose} title="Create Order">
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          <div className="bg-[#1f1f1f] border border-[#333] rounded-xl p-4 mb-5">
            <p className="text-[#f5f5f5] font-bold text-sm">
              Customer Information
            </p>

            <p className="text-[#ababab] text-xs mt-1">
              Type name or phone to auto-fill from customer history.
            </p>
          </div>

          <div ref={suggestionRef} className="relative">
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Customer Name <span className="text-[#777]">(Optional)</span>
            </label>

            <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#1f1f1f] border border-[#333] focus-within:border-[#f6b100]">
              <FaUser className="text-[#777] shrink-0" />

              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => {
                  if (name.trim().length >= 2) setShowSuggestions(true);
                }}
                type="text"
                placeholder="Walk-In Customer"
                className="bg-transparent w-full text-white focus:outline-none text-sm sm:text-base"
                autoComplete="off"
              />
            </div>

            {showSuggestions && searchQuery.length >= 2 && (
              <CustomerSuggestions
                customers={customerSuggestions}
                isLoading={isSearchingCustomer}
                onSelect={handleSelectCustomer}
              />
            )}
          </div>

          <div className="relative mt-4">
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Customer Phone <span className="text-[#777]">(Optional)</span>
            </label>

            <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-[#1f1f1f] border border-[#333] focus-within:border-[#f6b100]">
              <FaPhoneAlt className="text-[#777] shrink-0" />

              <input
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onFocus={() => {
                  if (phone.trim().length >= 2) setShowSuggestions(true);
                }}
                type="tel"
                inputMode="numeric"
                placeholder="+91-9999999999"
                className="bg-transparent w-full text-white focus:outline-none text-sm sm:text-base"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Special Instruction{" "}
              <span className="text-[#777]">(Optional)</span>
            </label>

            <select
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-3 border border-[#333] outline-none focus:border-[#f6b100]"
            >
              {SYSTEM_NOTE_OPTIONS.map((note) => (
                <option key={note || "none"} value={note}>
                  {note || "Select Instruction"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 mt-4 text-sm font-medium text-[#ababab]">
              Order Type
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <OrderTypeButton
                label="Walk-In"
                active={orderType === "walkin"}
                onClick={() => setOrderType("walkin")}
                activeClass="bg-green-500 text-white"
              />

              <OrderTypeButton
                label="Takeaway"
                active={orderType === "takeaway"}
                onClick={() => setOrderType("takeaway")}
                activeClass="bg-blue-500 text-white"
              />

              <OrderTypeButton
                label="Dine-In"
                active={orderType === "dinein"}
                onClick={() => setOrderType("dinein")}
                activeClass="bg-[#F6B100] text-black"
              />
            </div>
          </div>

          {orderType === "dinein" && (
            <div>
              <label className="block mb-2 mt-4 text-sm font-medium text-[#ababab]">
                Guests
              </label>

              <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg border border-[#333]">
                <button
                  type="button"
                  onClick={() =>
                    setGuestCount((prev) => Math.max(Number(prev) - 1, 1))
                  }
                  className="text-yellow-500 text-2xl w-10 h-10 rounded-lg hover:bg-[#2a2a2a]"
                >
                  &minus;
                </button>

                <span className="text-white font-semibold">
                  {guestCount} {guestCount === 1 ? "Person" : "Persons"}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setGuestCount((prev) => Math.min(Number(prev) + 1, 20))
                  }
                  className="text-yellow-500 text-2xl w-10 h-10 rounded-lg hover:bg-[#2a2a2a]"
                >
                  &#43;
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#f5f5f5] py-3 rounded-lg font-bold transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCreateOrder}
              className="bg-[#F6B100] hover:bg-yellow-500 text-black py-3 rounded-lg font-bold transition"
            >
              {orderType === "dinein" ? "Select Table" : "Go To Menu"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const CustomerSuggestions = ({ customers, isLoading, onSelect }) => {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-[#262626] border border-[#333] rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
      {isLoading ? (
        <div className="px-4 py-3 text-[#ababab] text-sm">
          Searching customer...
        </div>
      ) : customers.length === 0 ? (
        <div className="px-4 py-3 text-[#ababab] text-sm">
          No previous customer found
        </div>
      ) : (
        customers.map((customer, index) => (
          <button
            key={`${customer.phone || customer.name}-${index}`}
            type="button"
            onClick={() => onSelect(customer)}
            className="w-full text-left px-4 py-3 hover:bg-[#333] transition border-b border-[#333] last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">
                  {customer.name || "Walk-In Customer"}
                </p>

                <p className="text-[#ababab] text-xs mt-1">
                  {customer.phone || "No phone"}
                </p>
              </div>

              <span className="bg-[#1f1f1f] text-[#f6b100] px-2 py-1 rounded-full text-[11px] font-bold shrink-0">
                {customer.totalOrders || customer.orderCount || 0} Orders
              </span>
            </div>

            {customer.lastOrderDate && (
              <p className="text-[#777] text-[11px] mt-2">
                Last visit:{" "}
                {new Date(customer.lastOrderDate).toLocaleDateString("en-IN")}
              </p>
            )}
          </button>
        ))
      )}
    </div>
  );
};

const OrderTypeButton = ({ label, active, onClick, activeClass }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 rounded-lg font-semibold transition-all ${
        active
          ? activeClass
          : "bg-[#1f1f1f] text-[#ababab] hover:text-white hover:bg-[#2a2a2a]"
      }`}
    >
      {label}
    </button>
  );
};

export default BottomNav;
