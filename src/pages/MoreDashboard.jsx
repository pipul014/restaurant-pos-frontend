import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaEye, FaMoneyBillWave, FaTrash } from "react-icons/fa";
import { BsCartPlus, BsCashCoin } from "react-icons/bs";

import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";

import {
  addPurchase,
  getPurchases,
  payPurchaseDue,
  deletePurchase,
  addSalary,
  getSalaries,
  paySalaryDue,
  deleteSalary,
  searchVendors,
} from "../https";

const categories = [
  "Grocery",
  "Meat",
  "Chicken",
  "Fish",
  "Vegetables",
  "Gas",
  "Restaurant Items",
  "Other",
];

const units = ["Kg", "Litre", "Piece", "Packet", "Box"];
const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Card", "Other"];

const emptyPurchaseData = {
  vendorName: "",
  vendorPhone: "",
  purchaseDate: "",
  paidAmount: "",
  paymentMethod: "Cash",
  note: "",
  items: [
    {
      itemName: "",
      category: "",
      unit: "",
      quantity: "",
      rate: "",
    },
  ],
};

const emptySalaryData = {
  employeeName: "",
  employeePhone: "",
  salaryMonth: "",
  totalSalary: "",
  paidAmount: "",
  paymentMethod: "Cash",
  note: "",
};

const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const MoreDashboard = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("expenses");

  const [selectedPurchaseInvoice, setSelectedPurchaseInvoice] = useState(null);
  const [selectedSalaryInvoice, setSelectedSalaryInvoice] = useState(null);

  const [purchasePayModal, setPurchasePayModal] = useState(null);
  const [salaryPayModal, setSalaryPayModal] = useState(null);

  const [purchaseData, setPurchaseData] = useState(emptyPurchaseData);
  const [salaryData, setSalaryData] = useState(emptySalaryData);

  const [vendorSearchText, setVendorSearchText] = useState("");
  const debouncedVendorSearch = useDebounce(vendorSearchText);

  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);

  const [purchaseDuePayment, setPurchaseDuePayment] = useState({
    amount: "",
    paymentMethod: "Cash",
    paymentDate: "",
    note: "",
  });

  const [salaryDuePayment, setSalaryDuePayment] = useState({
    amount: "",
    paymentMethod: "Cash",
    paymentDate: "",
    note: "",
  });

  useEffect(() => {
    document.title = "POS | More";
  }, []);

  const {
    data: purchaseRes,
    isLoading: purchasesLoading,
    isError: purchasesError,
  } = useQuery({
    queryKey: ["purchases"],
    queryFn: getPurchases,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: salaryRes,
    isLoading: salariesLoading,
    isError: salariesError,
  } = useQuery({
    queryKey: ["salaries"],
    queryFn: getSalaries,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: vendorRes } = useQuery({
    queryKey: ["vendors", debouncedVendorSearch],
    queryFn: () => searchVendors(debouncedVendorSearch),
    enabled: debouncedVendorSearch.trim().length >= 2,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const purchases = purchaseRes?.data?.data || [];
  const salaries = salaryRes?.data?.data || [];
  const vendorSuggestions = vendorRes?.data?.data || [];

  const invalidatePurchases = () => {
    queryClient.invalidateQueries({ queryKey: ["purchases"] });
  };

  const invalidateSalaries = () => {
    queryClient.invalidateQueries({ queryKey: ["salaries"] });
  };

  const purchaseMutation = useMutation({
    mutationFn: addPurchase,
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message || "Purchase added successfully", {
        variant: "success",
      });

      setPurchaseData(emptyPurchaseData);
      setVendorSearchText("");
      setShowVendorSuggestions(false);
      setActiveTab("expenses");
      invalidatePurchases();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to save purchase",
        { variant: "error" },
      );
    },
  });

  const salaryMutation = useMutation({
    mutationFn: addSalary,
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message || "Salary added successfully", {
        variant: "success",
      });

      setSalaryData(emptySalaryData);
      setActiveTab("salary");
      invalidateSalaries();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to save salary",
        { variant: "error" },
      );
    },
  });

  const purchaseDueMutation = useMutation({
    mutationFn: payPurchaseDue,
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message || "Due paid successfully", {
        variant: "success",
      });

      setPurchasePayModal(null);
      setPurchaseDuePayment({
        amount: "",
        paymentMethod: "Cash",
        paymentDate: "",
        note: "",
      });

      invalidatePurchases();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to pay purchase due",
        { variant: "error" },
      );
    },
  });

  const salaryDueMutation = useMutation({
    mutationFn: paySalaryDue,
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message || "Salary due paid successfully", {
        variant: "success",
      });

      setSalaryPayModal(null);
      setSalaryDuePayment({
        amount: "",
        paymentMethod: "Cash",
        paymentDate: "",
        note: "",
      });

      invalidateSalaries();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to pay salary due",
        { variant: "error" },
      );
    },
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: deletePurchase,
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message || "Purchase deleted", {
        variant: "success",
      });

      invalidatePurchases();
    },
    onError: () => {
      enqueueSnackbar("Failed to delete purchase", { variant: "error" });
    },
  });

  const deleteSalaryMutation = useMutation({
    mutationFn: deleteSalary,
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message || "Salary deleted", {
        variant: "success",
      });

      invalidateSalaries();
    },
    onError: () => {
      enqueueSnackbar("Failed to delete salary", { variant: "error" });
    },
  });

  const purchaseTotal = useMemo(() => {
    return purchaseData.items.reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.rate || 0);
    }, 0);
  }, [purchaseData.items]);

  const purchaseDue = Math.max(
    purchaseTotal - Number(purchaseData.paidAmount || 0),
    0,
  );

  const salaryDue = Math.max(
    Number(salaryData.totalSalary || 0) - Number(salaryData.paidAmount || 0),
    0,
  );

  const purchaseOverview = useMemo(
    () => ({
      totalPurchaseAmount: purchases.reduce(
        (sum, item) => sum + Number(item.totalAmount || 0),
        0,
      ),
      totalPurchaseItems: purchases.reduce(
        (sum, item) => sum + Number(item.items?.length || 0),
        0,
      ),
      purchasePaid: purchases.reduce(
        (sum, item) => sum + Number(item.paidAmount || 0),
        0,
      ),
      purchaseDue: purchases.reduce(
        (sum, item) => sum + Number(item.dueAmount || 0),
        0,
      ),
    }),
    [purchases],
  );

  const salaryOverview = useMemo(
    () => ({
      totalSalary: salaries.reduce(
        (sum, item) => sum + Number(item.totalSalary || 0),
        0,
      ),
      totalEmployees: new Set(salaries.map((item) => item.employeeName)).size,
      salaryPaid: salaries.reduce(
        (sum, item) => sum + Number(item.paidAmount || 0),
        0,
      ),
      salaryDue: salaries.reduce(
        (sum, item) => sum + Number(item.dueAmount || 0),
        0,
      ),
    }),
    [salaries],
  );

  const handlePurchaseMainChange = (e) => {
    setPurchaseData({
      ...purchaseData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVendorSearch = (value, fieldName) => {
    setPurchaseData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setVendorSearchText(value);

    if (value.trim().length < 2) {
      setShowVendorSuggestions(false);
      return;
    }

    setShowVendorSuggestions(true);
  };

  const handleSelectVendor = (vendor) => {
    setPurchaseData((prev) => ({
      ...prev,
      vendorName: vendor.vendorName || "",
      vendorPhone: vendor.vendorPhone || "",
    }));

    setVendorSearchText("");
    setShowVendorSuggestions(false);
  };

  const handlePurchaseItemChange = (index, e) => {
    const updatedItems = [...purchaseData.items];
    updatedItems[index][e.target.name] = e.target.value;

    setPurchaseData({
      ...purchaseData,
      items: updatedItems,
    });
  };

  const addPurchaseItemRow = () => {
    setPurchaseData({
      ...purchaseData,
      items: [
        ...purchaseData.items,
        {
          itemName: "",
          category: "",
          unit: "",
          quantity: "",
          rate: "",
        },
      ],
    });
  };

  const removePurchaseItemRow = (index) => {
    if (purchaseData.items.length === 1) return;

    setPurchaseData({
      ...purchaseData,
      items: purchaseData.items.filter((_, i) => i !== index),
    });
  };

  const handleSavePurchase = (e) => {
    e.preventDefault();

    const payload = {
      ...purchaseData,
      vendorName: purchaseData.vendorName.trim(),
      vendorPhone: purchaseData.vendorPhone.trim(),
      paidAmount: Number(purchaseData.paidAmount || 0),
      items: purchaseData.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
    };

    purchaseMutation.mutate(payload);
  };

  const handleSaveSalary = (e) => {
    e.preventDefault();

    const payload = {
      ...salaryData,
      totalSalary: Number(salaryData.totalSalary),
      paidAmount: Number(salaryData.paidAmount || 0),
    };

    salaryMutation.mutate(payload);
  };

  const handlePurchaseDuePayment = (e) => {
    e.preventDefault();

    purchaseDueMutation.mutate({
      purchaseId: purchasePayModal._id,
      amount: Number(purchaseDuePayment.amount),
      paymentMethod: purchaseDuePayment.paymentMethod,
      paymentDate: purchaseDuePayment.paymentDate,
      note: purchaseDuePayment.note,
    });
  };

  const handleSalaryDuePayment = (e) => {
    e.preventDefault();

    salaryDueMutation.mutate({
      salaryId: salaryPayModal._id,
      amount: Number(salaryDuePayment.amount),
      paymentMethod: salaryDuePayment.paymentMethod,
      paymentDate: salaryDuePayment.paymentDate,
      note: salaryDuePayment.note,
    });
  };

  const isLoading = purchasesLoading || salariesLoading;
  const hasError = purchasesError || salariesError;

  if (isLoading) {
    return (
      <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] p-6 text-white">
        Loading more dashboard...
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] p-6 text-red-400">
        Failed to load More Dashboard data.
      </section>
    );
  }

  return (
    <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-24">
      <div className="px-4 sm:px-6 lg:px-10 py-5 sm:py-6">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />

          <div>
            <h1 className="text-[#f5f5f5] text-2xl sm:text-3xl font-bold tracking-wider">
              More Dashboard
            </h1>

            <p className="text-[#ababab] text-sm mt-1">
              Manage daily purchases, expenses and salaries.
            </p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:w-auto">
            <button
              onClick={() => setActiveTab("addPurchase")}
              className="bg-[#1a1a1a] hover:bg-[#262626] text-white px-5 py-3 rounded-xl font-bold border border-[#333]"
            >
              Add Daily Purchase <BsCartPlus className="inline ml-2" />
            </button>

            <button
              onClick={() => setActiveTab("addSalary")}
              className="bg-[#1a1a1a] hover:bg-[#262626] text-white px-5 py-3 rounded-xl font-bold border border-[#333]"
            >
              Add Salary <BsCashCoin className="inline ml-2" />
            </button>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="flex gap-3 min-w-max">
              <TabButton
                title="Expenses"
                id="expenses"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <TabButton
                title="Salary"
                id="salary"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>
        </div>

        {activeTab === "expenses" && (
          <>
            <SectionTitle
              title="Purchase Overview"
              subtitle="Daily purchase amount, paid amount and dues"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
              <MetricCard
                title="Total Purchase Amount"
                value={formatMoney(purchaseOverview.totalPurchaseAmount)}
                color="#1f8a70"
              />
              <MetricCard
                title="Total Items"
                value={purchaseOverview.totalPurchaseItems}
                color="#5b8fb9"
              />
              <MetricCard
                title="Purchase Paid"
                value={formatMoney(purchaseOverview.purchasePaid)}
                color="#9c6644"
              />
              <MetricCard
                title="Purchase Dues"
                value={formatMoney(purchaseOverview.purchaseDue)}
                color="#7b2cbf"
              />
            </div>

            <TableCard title="Expenses">
              {purchases.length === 0 ? (
                <p className="text-[#ababab]">No purchases found.</p>
              ) : (
                purchases.map((item) => (
                  <RecordCard
                    key={item._id}
                    fields={[
                      ["Invoice", item.invoiceNo],
                      ["Vendor", item.vendorName],
                      ["Phone", item.vendorPhone || "N/A"],
                      ["Total", formatMoney(item.totalAmount)],
                      ["Paid", formatMoney(item.paidAmount)],
                      ["Due", formatMoney(item.dueAmount)],
                      ["Status", item.paymentStatus],
                    ]}
                    actions={
                      <>
                        <ActionButton
                          onClick={() => setSelectedPurchaseInvoice(item)}
                        >
                          <FaEye />
                        </ActionButton>

                        {item.dueAmount > 0 && (
                          <ActionButton
                            onClick={() => setPurchasePayModal(item)}
                          >
                            <FaMoneyBillWave />
                          </ActionButton>
                        )}

                        <ActionButton
                          danger
                          onClick={() =>
                            deletePurchaseMutation.mutate(item._id)
                          }
                        >
                          <FaTrash />
                        </ActionButton>
                      </>
                    }
                  />
                ))
              )}
            </TableCard>
          </>
        )}

        {activeTab === "salary" && (
          <>
            <SectionTitle
              title="Salary Overview"
              subtitle="Employee salary amount, paid amount and dues"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
              <MetricCard
                title="Total Salary"
                value={formatMoney(salaryOverview.totalSalary)}
                color="#1f8a70"
              />
              <MetricCard
                title="Total Employees"
                value={salaryOverview.totalEmployees}
                color="#5b8fb9"
              />
              <MetricCard
                title="Salary Paid"
                value={formatMoney(salaryOverview.salaryPaid)}
                color="#9c6644"
              />
              <MetricCard
                title="Salary Dues"
                value={formatMoney(salaryOverview.salaryDue)}
                color="#7b2cbf"
              />
            </div>

            <TableCard title="Salary">
              {salaries.length === 0 ? (
                <p className="text-[#ababab]">No salary records found.</p>
              ) : (
                salaries.map((item) => (
                  <RecordCard
                    key={item._id}
                    fields={[
                      ["Salary No", item.salaryNo],
                      ["Employee", item.employeeName],
                      ["Month", item.salaryMonth],
                      ["Total", formatMoney(item.totalSalary)],
                      ["Paid", formatMoney(item.paidAmount)],
                      ["Due", formatMoney(item.dueAmount)],
                      ["Status", item.paymentStatus],
                    ]}
                    actions={
                      <>
                        <ActionButton
                          onClick={() => setSelectedSalaryInvoice(item)}
                        >
                          <FaEye />
                        </ActionButton>

                        {item.dueAmount > 0 && (
                          <ActionButton onClick={() => setSalaryPayModal(item)}>
                            <FaMoneyBillWave />
                          </ActionButton>
                        )}

                        <ActionButton
                          danger
                          onClick={() => deleteSalaryMutation.mutate(item._id)}
                        >
                          <FaTrash />
                        </ActionButton>
                      </>
                    }
                  />
                ))
              )}
            </TableCard>
          </>
        )}

        {activeTab === "addPurchase" && (
          <FormCard title="Add Daily Purchase">
            <form onSubmit={handleSavePurchase}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="relative">
                  <Input
                    name="vendorName"
                    value={purchaseData.vendorName}
                    onChange={(e) =>
                      handleVendorSearch(e.target.value, "vendorName")
                    }
                    placeholder="Vendor Name"
                  />

                  {showVendorSuggestions && vendorSuggestions.length > 0 && (
                    <VendorSuggestionBox
                      vendors={vendorSuggestions}
                      onSelect={handleSelectVendor}
                    />
                  )}
                </div>

                <div className="relative">
                  <Input
                    name="vendorPhone"
                    value={purchaseData.vendorPhone}
                    onChange={(e) =>
                      handleVendorSearch(e.target.value, "vendorPhone")
                    }
                    placeholder="Vendor Phone"
                    required={false}
                  />

                  {showVendorSuggestions && vendorSuggestions.length > 0 && (
                    <VendorSuggestionBox
                      vendors={vendorSuggestions}
                      onSelect={handleSelectVendor}
                    />
                  )}
                </div>

                <Input
                  type="date"
                  name="purchaseDate"
                  value={purchaseData.purchaseDate}
                  onChange={handlePurchaseMainChange}
                />

                <Select
                  name="paymentMethod"
                  value={purchaseData.paymentMethod}
                  onChange={handlePurchaseMainChange}
                  options={paymentMethods}
                />

                <Input
                  type="number"
                  name="paidAmount"
                  value={purchaseData.paidAmount}
                  onChange={handlePurchaseMainChange}
                  placeholder="Paid Amount"
                  required={false}
                />
              </div>

              <h3 className="text-white font-semibold mt-6 mb-3">Items</h3>

              <div className="space-y-4">
                {purchaseData.items.map((item, index) => {
                  const rowTotal =
                    Number(item.quantity || 0) * Number(item.rate || 0);

                  return (
                    <div
                      key={index}
                      className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-3">
                        <Input
                          name="itemName"
                          value={item.itemName}
                          onChange={(e) => handlePurchaseItemChange(index, e)}
                          placeholder="Item Name"
                        />

                        <Select
                          name="category"
                          value={item.category}
                          onChange={(e) => handlePurchaseItemChange(index, e)}
                          options={categories}
                        />

                        <Select
                          name="unit"
                          value={item.unit}
                          onChange={(e) => handlePurchaseItemChange(index, e)}
                          options={units}
                        />

                        <Input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handlePurchaseItemChange(index, e)}
                          placeholder="Qty"
                        />

                        <Input
                          type="number"
                          name="rate"
                          value={item.rate}
                          onChange={(e) => handlePurchaseItemChange(index, e)}
                          placeholder="Rate"
                        />

                        <div className="bg-[#1f1f1f] text-white p-4 rounded-lg">
                          {formatMoney(rowTotal)}
                        </div>

                        <button
                          type="button"
                          onClick={() => removePurchaseItemRow(index)}
                          className="bg-red-500 text-white rounded-lg py-3 disabled:opacity-50"
                          disabled={purchaseData.items.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addPurchaseItemRow}
                className="bg-[#1a1a1a] text-white px-5 py-3 rounded-lg mt-4 border border-[#333]"
              >
                + Add Item
              </button>

              <textarea
                name="note"
                value={purchaseData.note}
                onChange={handlePurchaseMainChange}
                placeholder="Note"
                className="bg-[#1f1f1f] text-white p-4 rounded-lg outline-none w-full mt-5 resize-none min-h-[110px]"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <SummaryBox
                  title="Total Amount"
                  value={formatMoney(purchaseTotal)}
                />
                <SummaryBox
                  title="Paid Amount"
                  value={formatMoney(purchaseData.paidAmount)}
                />
                <SummaryBox
                  title="Due Amount"
                  value={formatMoney(purchaseDue)}
                />
              </div>

              <button
                disabled={purchaseMutation.isPending}
                className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold mt-6 disabled:opacity-60"
              >
                {purchaseMutation.isPending ? "Saving..." : "Save Purchase"}
              </button>
            </form>
          </FormCard>
        )}

        {activeTab === "addSalary" && (
          <FormCard title="Add Salary">
            <form onSubmit={handleSaveSalary}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Input
                  name="employeeName"
                  value={salaryData.employeeName}
                  onChange={(e) =>
                    setSalaryData({
                      ...salaryData,
                      employeeName: e.target.value,
                    })
                  }
                  placeholder="Employee Name"
                />

                <Input
                  name="employeePhone"
                  value={salaryData.employeePhone}
                  onChange={(e) =>
                    setSalaryData({
                      ...salaryData,
                      employeePhone: e.target.value,
                    })
                  }
                  placeholder="Employee Phone"
                  required={false}
                />

                <Input
                  type="month"
                  name="salaryMonth"
                  value={salaryData.salaryMonth}
                  onChange={(e) =>
                    setSalaryData({
                      ...salaryData,
                      salaryMonth: e.target.value,
                    })
                  }
                />

                <Input
                  type="number"
                  name="totalSalary"
                  value={salaryData.totalSalary}
                  onChange={(e) =>
                    setSalaryData({
                      ...salaryData,
                      totalSalary: e.target.value,
                    })
                  }
                  placeholder="Total Salary"
                />

                <Input
                  type="number"
                  name="paidAmount"
                  value={salaryData.paidAmount}
                  onChange={(e) =>
                    setSalaryData({
                      ...salaryData,
                      paidAmount: e.target.value,
                    })
                  }
                  placeholder="Paid Amount"
                  required={false}
                />

                <Select
                  name="paymentMethod"
                  value={salaryData.paymentMethod}
                  onChange={(e) =>
                    setSalaryData({
                      ...salaryData,
                      paymentMethod: e.target.value,
                    })
                  }
                  options={paymentMethods}
                />
              </div>

              <textarea
                name="note"
                value={salaryData.note}
                onChange={(e) =>
                  setSalaryData({ ...salaryData, note: e.target.value })
                }
                placeholder="Note"
                className="bg-[#1f1f1f] text-white p-4 rounded-lg outline-none w-full mt-5 resize-none min-h-[110px]"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <SummaryBox
                  title="Total Salary"
                  value={formatMoney(salaryData.totalSalary)}
                />
                <SummaryBox
                  title="Paid Amount"
                  value={formatMoney(salaryData.paidAmount)}
                />
                <SummaryBox title="Due Amount" value={formatMoney(salaryDue)} />
              </div>

              <button
                disabled={salaryMutation.isPending}
                className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold mt-6 disabled:opacity-60"
              >
                {salaryMutation.isPending ? "Saving..." : "Save Salary"}
              </button>
            </form>
          </FormCard>
        )}
      </div>

      {selectedPurchaseInvoice && (
        <PurchaseInvoiceModal
          invoice={selectedPurchaseInvoice}
          onClose={() => setSelectedPurchaseInvoice(null)}
        />
      )}

      {selectedSalaryInvoice && (
        <SalaryInvoiceModal
          salary={selectedSalaryInvoice}
          onClose={() => setSelectedSalaryInvoice(null)}
        />
      )}

      {purchasePayModal && (
        <DuePaymentModal
          title="Pay Purchase Due"
          dueAmount={purchasePayModal.dueAmount}
          data={purchaseDuePayment}
          setData={setPurchaseDuePayment}
          onClose={() => setPurchasePayModal(null)}
          onSubmit={handlePurchaseDuePayment}
          loading={purchaseDueMutation.isPending}
        />
      )}

      {salaryPayModal && (
        <DuePaymentModal
          title="Pay Salary Due"
          dueAmount={salaryPayModal.dueAmount}
          data={salaryDuePayment}
          setData={setSalaryDuePayment}
          onClose={() => setSalaryPayModal(null)}
          onSubmit={handleSalaryDuePayment}
          loading={salaryDueMutation.isPending}
        />
      )}

      <BottomNav />
    </section>
  );
};

const VendorSuggestionBox = ({ vendors, onSelect }) => (
  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-44 overflow-y-auto rounded-lg bg-[#2a2a2a] border border-[#3a3a3a] shadow-xl">
    {vendors.map((vendor) => (
      <button
        type="button"
        key={vendor._id}
        onClick={() => onSelect(vendor)}
        className="w-full text-left px-4 py-3 hover:bg-[#383838] transition"
      >
        <p className="text-white font-semibold text-sm">{vendor.vendorName}</p>
        <p className="text-[#ababab] text-xs">
          {vendor.vendorPhone || "No phone"}
        </p>
      </button>
    ))}
  </div>
);

const TabButton = ({ title, id, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`px-5 py-3 rounded-lg font-bold whitespace-nowrap ${
      activeTab === id
        ? "bg-[#343434] text-white"
        : "bg-[#1a1a1a] text-[#ababab]"
    }`}
  >
    {title}
  </button>
);

const SectionTitle = ({ title, subtitle }) => (
  <div className="mt-10">
    <h2 className="font-semibold text-[#f5f5f5] text-xl">{title}</h2>
    <p className="text-sm text-[#ababab] mt-1">{subtitle}</p>
  </div>
);

const MetricCard = ({ title, value, color }) => (
  <div
    className="rounded-xl p-4 min-h-[110px]"
    style={{ backgroundColor: color }}
  >
    <p className="font-medium text-xs text-white uppercase tracking-wide">
      {title}
    </p>
    <p className="mt-3 font-bold text-2xl text-white break-words">{value}</p>
  </div>
);

const FormCard = ({ title, children }) => (
  <div className="bg-[#262626] rounded-xl p-4 sm:p-6 mt-8 sm:mt-10">
    <h2 className="text-white text-xl font-bold mb-6">{title}</h2>
    {children}
  </div>
);

const TableCard = ({ title, children }) => (
  <div className="bg-[#262626] rounded-xl p-4 sm:p-6 mt-8 sm:mt-10">
    <h2 className="text-white text-xl font-bold mb-6">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);

const RecordCard = ({ fields, actions }) => (
  <div className="bg-[#1f1f1f] text-white p-4 rounded-xl border border-[#333]">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {fields.map(([label, value]) => (
        <div key={label}>
          <p className="text-[#ababab] text-xs">{label}</p>
          <p className="font-semibold mt-1 break-words">{value || "N/A"}</p>
        </div>
      ))}
    </div>

    <div className="flex flex-wrap gap-2 mt-4">{actions}</div>
  </div>
);

const SummaryBox = ({ title, value }) => (
  <div className="bg-[#1f1f1f] p-4 rounded-lg">
    <p className="text-[#ababab] text-sm">{title}</p>
    <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">{value}</h2>
  </div>
);

const Input = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = true,
}) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className="bg-[#1f1f1f] text-white p-4 rounded-lg outline-none w-full border border-transparent focus:border-yellow-400"
  />
);

const Select = ({ name, value, onChange, options }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    required
    className="bg-[#1f1f1f] text-white p-4 rounded-lg outline-none w-full border border-transparent focus:border-yellow-400"
  >
    <option value="">Select</option>
    {options.map((item) => (
      <option key={item} value={item} className="text-black">
        {item}
      </option>
    ))}
  </select>
);

const ActionButton = ({ children, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`${
      danger ? "bg-red-500" : "bg-blue-500"
    } p-3 rounded-lg text-white`}
  >
    {children}
  </button>
);

const PurchaseInvoiceModal = ({ invoice, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-[#262626] w-full max-w-[850px] max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">
      <ModalHeader title="Purchase Invoice" onClose={onClose} />

      <div className="text-white mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Info label="Invoice No" value={invoice.invoiceNo} />
        <Info label="Vendor" value={invoice.vendorName} />
        <Info label="Vendor Phone" value={invoice.vendorPhone || "N/A"} />
        <Info
          label="Date"
          value={new Date(invoice.purchaseDate).toLocaleDateString()}
        />
        <Info label="Status" value={invoice.paymentStatus} />
      </div>

      <div className="overflow-x-auto mt-6">
        <table className="w-full text-white min-w-[650px]">
          <thead>
            <tr className="border-b border-[#444]">
              <th className="text-left py-2">Item</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-[#333]">
                <td className="py-2">{item.itemName}</td>
                <td className="text-center">{item.category}</td>
                <td className="text-center">
                  {item.quantity} {item.unit}
                </td>
                <td className="text-center">{formatMoney(item.rate)}</td>
                <td className="text-center">{formatMoney(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InvoiceTotals
        total={invoice.totalAmount}
        paid={invoice.paidAmount}
        due={invoice.dueAmount}
      />

      <PaymentHistory payments={invoice.payments} />
    </div>
  </div>
);

const SalaryInvoiceModal = ({ salary, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-[#262626] w-full max-w-[650px] max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">
      <ModalHeader title="Salary Details" onClose={onClose} />

      <div className="text-white mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Info label="Salary No" value={salary.salaryNo} />
        <Info label="Employee" value={salary.employeeName} />
        <Info label="Phone" value={salary.employeePhone || "N/A"} />
        <Info label="Month" value={salary.salaryMonth} />
        <Info label="Status" value={salary.paymentStatus} />
      </div>

      <InvoiceTotals
        total={salary.totalSalary}
        paid={salary.paidAmount}
        due={salary.dueAmount}
      />

      <PaymentHistory payments={salary.payments} />
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div className="flex justify-between items-start gap-4">
    <h2 className="text-white text-xl sm:text-2xl font-bold">{title}</h2>
    <button
      onClick={onClose}
      className="text-white bg-[#1f1f1f] w-9 h-9 rounded-lg"
    >
      X
    </button>
  </div>
);

const Info = ({ label, value }) => (
  <div className="bg-[#1f1f1f] p-3 rounded-lg">
    <p className="text-[#ababab] text-xs">{label}</p>
    <p className="text-white font-semibold mt-1 break-words">
      {value || "N/A"}
    </p>
  </div>
);

const InvoiceTotals = ({ total, paid, due }) => (
  <div className="text-white mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
    <SummaryBox title="Total Amount" value={formatMoney(total)} />
    <SummaryBox title="Paid Amount" value={formatMoney(paid)} />
    <SummaryBox title="Due Amount" value={formatMoney(due)} />
  </div>
);

const PaymentHistory = ({ payments = [] }) => (
  <>
    <h3 className="text-white text-xl font-bold mt-6">Payment History</h3>

    <div className="mt-3 space-y-2">
      {payments.length === 0 ? (
        <p className="text-[#ababab]">No payment found.</p>
      ) : (
        payments.map((payment, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#1f1f1f] p-3 rounded text-white"
          >
            <p>{new Date(payment.paymentDate).toLocaleDateString()}</p>
            <p>{payment.paymentMethod}</p>
            <p>{formatMoney(payment.amount)}</p>
            <p>{payment.note || "N/A"}</p>
          </div>
        ))
      )}
    </div>
  </>
);

const DuePaymentModal = ({
  title,
  dueAmount,
  data,
  setData,
  onClose,
  onSubmit,
  loading,
}) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-[#262626] w-full max-w-[450px] rounded-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
      <ModalHeader title={title} onClose={onClose} />

      <p className="text-[#ababab] mt-3">
        Due Amount: {formatMoney(dueAmount)}
      </p>

      <form onSubmit={onSubmit} className="space-y-4 mt-6">
        <Input
          type="number"
          name="amount"
          value={data.amount}
          onChange={(e) => setData({ ...data, amount: e.target.value })}
          placeholder="Payment Amount"
        />

        <Select
          name="paymentMethod"
          value={data.paymentMethod}
          onChange={(e) => setData({ ...data, paymentMethod: e.target.value })}
          options={paymentMethods}
        />

        <Input
          type="date"
          name="paymentDate"
          value={data.paymentDate}
          onChange={(e) => setData({ ...data, paymentDate: e.target.value })}
          required={false}
        />

        <textarea
          name="note"
          value={data.note}
          onChange={(e) => setData({ ...data, note: e.target.value })}
          placeholder="Note"
          className="bg-[#1f1f1f] text-white p-4 rounded-lg outline-none w-full resize-none min-h-[100px]"
        />

        <button
          disabled={loading}
          className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Payment"}
        </button>
      </form>
    </div>
  </div>
);

export default MoreDashboard;
