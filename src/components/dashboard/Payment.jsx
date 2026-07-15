import React, { useMemo, useState } from "react";
import { FaArrowTrendUp } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import { getPayments } from "../../https";

const getMethod = (method = "") => {
  const value = method.toLowerCase();

  if (value === "cash") return "Cash";
  if (value === "online") return "Online";
  if (value === "qr") return "QR";

  return "N/A";
};

const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const formatDate = (date) => {
  const d = new Date(date);

  if (isNaN(d.getTime())) return "N/A";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusColor = (status = "") => {
  const value = status.toLowerCase();

  if (["captured", "paid", "success", "completed"].includes(value)) {
    return "text-green-500";
  }

  if (["failed", "cancelled"].includes(value)) {
    return "text-red-500";
  }

  return "text-yellow-500";
};

const getOrderId = (payment) => {
  return (
    payment.orderNumber ||
    payment.invoiceNo ||
    payment.orderId?._id ||
    payment.orderId ||
    "N/A"
  );
};

const Payment = () => {
  const [methodFilter, setMethodFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
    retry: 1,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
  });

  const payments = useMemo(() => {
    return Array.isArray(data?.data?.data) ? data.data.data : [];
  }, [data]);

  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    if (methodFilter !== "All") {
      filtered = filtered.filter(
        (payment) => getMethod(payment.method) === methodFilter,
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      filtered = filtered.filter((payment) => {
        const orderId = getOrderId(payment);

        return (
          payment.paymentId?.toString().toLowerCase().includes(query) ||
          payment.orderNumber?.toString().toLowerCase().includes(query) ||
          payment.invoiceNo?.toString().toLowerCase().includes(query) ||
          payment.customerName?.toString().toLowerCase().includes(query) ||
          payment.paymentReference?.toString().toLowerCase().includes(query) ||
          orderId?.toString().toLowerCase().includes(query) ||
          payment.phone?.toString().toLowerCase().includes(query) ||
          payment.contact?.toString().toLowerCase().includes(query)
        );
      });
    }

    if (dateFilter !== "All") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);

        if (isNaN(paymentDate.getTime())) return false;

        paymentDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (today - paymentDate) / (1000 * 60 * 60 * 24),
        );

        if (dateFilter === "Today") return diffDays === 0;
        if (dateFilter === "Yesterday") return diffDays === 1;
        if (dateFilter === "7 Days") return diffDays >= 0 && diffDays <= 7;
        if (dateFilter === "30 Days") return diffDays >= 0 && diffDays <= 30;

        return true;
      });
    }

    return filtered;
  }, [payments, methodFilter, dateFilter, search]);

  const stats = useMemo(() => {
    return filteredPayments.reduce(
      (acc, payment) => {
        const amount = Number(payment.amount || 0);
        const method = getMethod(payment.method);

        acc.total += amount;

        if (method === "Cash") acc.cash += amount;
        if (method === "Online") acc.online += amount;
        if (method === "QR") acc.qr += amount;

        return acc;
      },
      {
        total: 0,
        cash: 0,
        online: 0,
        qr: 0,
      },
    );
  }, [filteredPayments]);

  if (isLoading) {
    return (
      <div className="bg-[#262626] rounded-xl p-6 text-white">
        Loading payments...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#262626] rounded-xl p-6 text-center">
        <p className="text-red-400">
          {error?.response?.data?.message || "Failed to load payments"}
        </p>

        <button
          onClick={() => refetch()}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-bold">Payments</h1>

          <p className="text-[#ababab] text-sm mt-1">
            Track Cash, Razorpay and QR payment collections.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] text-white px-4 py-2 rounded-lg disabled:opacity-60 w-full sm:w-auto"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <PaymentCard title="Total Revenue" amount={stats.total} color="green" />
        <PaymentCard title="Cash Revenue" amount={stats.cash} color="yellow" />
        <PaymentCard
          title="Razorpay Revenue"
          amount={stats.online}
          color="blue"
        />
        <PaymentCard title="QR Revenue" amount={stats.qr} color="purple" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6 sm:mt-8">
        <input
          type="search"
          placeholder="Search invoice, order, payment ID, customer, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-700 outline-none focus:border-yellow-400"
        />

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-700 outline-none focus:border-yellow-400"
        >
          <option>All</option>
          <option>Cash</option>
          <option>Online</option>
          <option>QR</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-700 outline-none focus:border-yellow-400 sm:col-span-2 xl:col-span-1"
        >
          <option>All</option>
          <option>Today</option>
          <option>Yesterday</option>
          <option>7 Days</option>
          <option>30 Days</option>
        </select>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl mt-6 sm:mt-8 overflow-hidden border border-[#2a2a2a]">
        <div className="hidden xl:grid grid-cols-8 px-6 py-4 border-b border-[#2a2a2a] text-[#ababab] font-semibold">
          <h1>Payment ID</h1>
          <h1>Order</h1>
          <h1>Customer</h1>
          <h1>Method</h1>
          <h1>Amount</h1>
          <h1>Status</h1>
          <h1>Phone</h1>
          <h1>Date</h1>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center text-[#ababab] py-10">
            No payments found
          </div>
        ) : (
          <>
            <div className="hidden xl:block">
              {filteredPayments.map((payment) => (
                <PaymentRow
                  key={payment._id || payment.paymentId}
                  payment={payment}
                />
              ))}
            </div>

            <div className="xl:hidden space-y-3 p-4">
              {filteredPayments.map((payment) => (
                <PaymentMobileCard
                  key={payment._id || payment.paymentId}
                  payment={payment}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const PaymentRow = ({ payment }) => {
  const orderId = getOrderId(payment);

  return (
    <div className="grid grid-cols-8 px-6 py-4 border-b border-[#2a2a2a] text-sm">
      <TableText value={payment.paymentId || "N/A"} />

      <TableText
        value={
          orderId !== "N/A"
            ? orderId.toString().slice(-12).toUpperCase()
            : "N/A"
        }
      />

      <TableText value={payment.customerName || "N/A"} muted />

      <TableText value={getMethod(payment.method)} muted />

      <TableText value={formatAmount(payment.amount)} />

      <p className={getStatusColor(payment.status)}>
        {payment.status || "Paid"}
      </p>

      <TableText value={payment.phone || payment.contact || "N/A"} muted />

      <TableText value={formatDate(payment.createdAt)} muted />
    </div>
  );
};

const PaymentMobileCard = ({ payment }) => {
  const orderId = getOrderId(payment);

  return (
    <div className="bg-[#262626] rounded-xl p-4 border border-[#333]">
      <div className="flex justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[#ababab] text-xs">Payment ID</p>

          <h3 className="text-white font-semibold break-all mt-1">
            {payment.paymentId || "N/A"}
          </h3>
        </div>

        <span
          className={`text-xs font-semibold h-fit px-3 py-1 rounded-full bg-[#1a1a1a] ${getStatusColor(
            payment.status,
          )}`}
        >
          {payment.status || "Paid"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <MobileInfo
          label="Order"
          value={
            orderId !== "N/A"
              ? orderId.toString().slice(-12).toUpperCase()
              : "N/A"
          }
        />

        <MobileInfo label="Customer" value={payment.customerName || "N/A"} />

        <MobileInfo label="Method" value={getMethod(payment.method)} />

        <MobileInfo label="Amount" value={formatAmount(payment.amount)} />

        <MobileInfo
          label="Phone"
          value={payment.phone || payment.contact || "N/A"}
        />

        <MobileInfo
          label="Reference"
          value={payment.paymentReference || "N/A"}
        />

        <MobileInfo label="Date" value={formatDate(payment.createdAt)} />
      </div>
    </div>
  );
};

const PaymentCard = ({ title, amount, color }) => {
  const colorClass = {
    green: "text-green-500",
    yellow: "text-yellow-500",
    blue: "text-blue-500",
    purple: "text-purple-500",
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6 border border-[#2a2a2a]">
      <div className="flex justify-between items-start gap-3">
        <h1 className="text-[#ababab] text-sm sm:text-base">{title}</h1>
        <FaArrowTrendUp className={`${colorClass[color]} shrink-0`} />
      </div>

      <h1 className="text-white text-2xl sm:text-3xl font-bold mt-4 break-words">
        {formatAmount(amount)}
      </h1>
    </div>
  );
};

const TableText = ({ value, muted = false }) => {
  return (
    <p
      className={`${muted ? "text-[#ababab]" : "text-white"} break-words pr-2`}
    >
      {value}
    </p>
  );
};

const MobileInfo = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="text-[#ababab] text-xs">{label}</p>
      <p className="text-white font-semibold break-words mt-1">{value}</p>
    </div>
  );
};

export default Payment;
