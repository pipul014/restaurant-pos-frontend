import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCustomers } from "../../https";

const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const CustomerDetailsModal = ({
  order,
  customerData,
  setCustomerData,
  onClose,
  onSubmit,
  loading,
}) => {
  const [searchText, setSearchText] = useState("");
  const [activeSearchField, setActiveSearchField] = useState(null);

  const debouncedSearch = useDebounce(searchText);

  const { data, isFetching } = useQuery({
    queryKey: ["customer-search", debouncedSearch],
    queryFn: () => searchCustomers(debouncedSearch),
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const suggestions = useMemo(() => {
    return Array.isArray(data?.data?.data) ? data.data.data : [];
  }, [data]);

  const openSuggestions = (fieldName, value) => {
    if (value?.trim().length >= 2) {
      setSearchText(value);
      setActiveSearchField(fieldName);
    } else {
      setSearchText("");
      setActiveSearchField(null);
    }
  };

  const closeSuggestions = () => {
    setSearchText("");
    setActiveSearchField(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name" || name === "phone") {
      openSuggestions(name, value);
    }
  };

  const handleSelectCustomer = (customer) => {
    setCustomerData((prev) => ({
      ...prev,
      name: customer.name || customer.customerName || "",
      phone: customer.phone || customer.customerPhone || "",
      guests: prev.guests || 1,
      systemNotes:
        customer.systemNotes || customer.notes || prev.systemNotes || "",
    }));

    closeSuggestions();
  };

  const handleFieldBlur = () => {
    setTimeout(() => {
      setActiveSearchField(null);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#262626] w-full max-w-[560px] rounded-2xl border border-[#333] p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-white text-xl sm:text-2xl font-bold">
              Update Customer Details
            </h2>

            <p className="text-[#ababab] text-sm mt-1">
              Order: {order?.orderNumber || "N/A"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#1f1f1f] hover:bg-[#333] text-white w-9 h-9 rounded-lg"
          >
            X
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <div
            className={`relative ${
              activeSearchField === "name" ? "mb-16" : ""
            }`}
          >
            <Input
              name="name"
              value={customerData.name || ""}
              onChange={handleChange}
              onFocus={() => openSuggestions("name", customerData.name || "")}
              onBlur={handleFieldBlur}
              placeholder="Customer Name"
            />

            {activeSearchField === "name" && (
              <SuggestionBox
                suggestions={suggestions}
                isFetching={isFetching}
                onSelect={handleSelectCustomer}
              />
            )}
          </div>

          <div
            className={`relative ${
              activeSearchField === "phone" ? "mb-16" : ""
            }`}
          >
            <Input
              name="phone"
              value={customerData.phone || ""}
              onChange={handleChange}
              onFocus={() => openSuggestions("phone", customerData.phone || "")}
              onBlur={handleFieldBlur}
              placeholder="Customer Phone"
              required={false}
            />

            {activeSearchField === "phone" && (
              <SuggestionBox
                suggestions={suggestions}
                isFetching={isFetching}
                onSelect={handleSelectCustomer}
              />
            )}
          </div>

          <Input
            type="number"
            name="guests"
            value={customerData.guests || ""}
            onChange={handleChange}
            onFocus={closeSuggestions}
            placeholder="Guests"
            required={false}
          />

          <textarea
            name="systemNotes"
            value={customerData.systemNotes || ""}
            onChange={handleChange}
            onFocus={closeSuggestions}
            placeholder="Customer Notes"
            className="bg-[#1f1f1f] text-white p-4 rounded-lg outline-none w-full border border-transparent focus:border-yellow-400 resize-none min-h-[100px]"
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#1f1f1f] hover:bg-[#333] text-white py-3 rounded-lg font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-3 rounded-lg font-bold disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SuggestionBox = ({ suggestions, isFetching, onSelect }) => {
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-40 overflow-y-auto bg-[#1f1f1f] border border-[#444] rounded-xl shadow-xl">
      {isFetching && (
        <div className="px-4 py-3 text-[#ababab] text-sm">
          Searching customers...
        </div>
      )}

      {!isFetching && suggestions.length === 0 && (
        <div className="px-4 py-3 text-[#ababab] text-sm">
          No customer found
        </div>
      )}

      {!isFetching &&
        suggestions.map((customer) => {
          const name = customer.name || customer.customerName || "Customer";
          const phone = customer.phone || customer.customerPhone || "No phone";

          return (
            <button
              key={customer._id || `${name}-${phone}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(customer)}
              className="w-full text-left px-4 py-3 hover:bg-[#333] transition"
            >
              <p className="text-white font-semibold text-sm">{name}</p>
              <p className="text-[#ababab] text-xs mt-1">Phone: {phone}</p>
            </button>
          );
        })}
    </div>
  );
};

const Input = ({
  type = "text",
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  required = true,
}) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    onFocus={onFocus}
    onBlur={onBlur}
    placeholder={placeholder}
    required={required}
    className="bg-[#1f1f1f] text-white p-4 rounded-lg outline-none w-full border border-transparent focus:border-yellow-400"
  />
);

export default CustomerDetailsModal;
