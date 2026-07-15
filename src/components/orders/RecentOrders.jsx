//faster
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  applyBillDiscount,
  cancelItem,
  cancelOrder,
  createOrderRazorpay,
  deleteOrder,
  getOrders,
  markItemServed,
  payOrder,
  updateCustomerDetails,
  updateItemNote,
  updateItemQuantity,
  verifyPaymentRazorpay,
} from "../../https";

import Invoice from "../invoice/Invoice";

import OrderCard from "./OrderCard";
import CancelModal from "./CancelModal";
import QuantityModal from "./QuantityModal";
import NoteModal from "./NoteModal";
import DiscountModal from "./DiscountModal";
import PaymentModal from "./PaymentModal";
import DetailsModal from "./DetailsModal";
import CustomerDetailsModal from "./CustomerDetailsModal";

import { CANCELLATION_REASONS, STATUS_TABS } from "./constants";
import { normalizeStatus } from "./statusMapper";
import useRealtimeSync from "../../hooks/useRealtimeSync";

const PAGE_LIMIT = 20;

const useDebounce = (value, delay = 250) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const orderHasRunningTimer = (order) => {
  return (order?.items || []).some((item) => {
    const status = normalizeStatus(item.status);
    return ["ACCEPTED", "PREPARING"].includes(status) && item.expectedReadyAt;
  });
};

const RecentOrders = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { userData, role } = useSelector((state) => state.user);
  const workflow = useSelector((state) => state.settings?.workflow || "KITCHEN");
  const userRole = userData?.role || role || "";

  useRealtimeSync();

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "All",
  );

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [page, setPage] = useState(1);
  const [servingItemIds, setServingItemIds] = useState(() => new Set());

  const [cancelData, setCancelData] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);

  const [quantityData, setQuantityData] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");

  const [noteData, setNoteData] = useState(null);
  const [selectedNote, setSelectedNote] = useState("");

  const [discountData, setDiscountData] = useState(null);
  const [discountType, setDiscountType] = useState("NONE");
  const [discountValue, setDiscountValue] = useState("");

  const [payData, setPayData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentReference, setPaymentReference] = useState("");

  const [detailsOrder, setDetailsOrder] = useState(null);

  const [customerEditData, setCustomerEditData] = useState(null);
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    guests: 1,
    systemNotes: "",
  });

  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const status = searchParams.get("status") || "All";
    setStatusFilter(status);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const visibleStatusTabs = useMemo(() => workflow === "POST_BILLING" ? STATUS_TABS.filter((tab) => ["All", "PAYMENT_PENDING", "PAID", "COMPLETED", "CANCELLED", "REJECTED"].includes(tab.value)) : STATUS_TABS, [workflow]);

  const selectedTab = useMemo(() => visibleStatusTabs.find((tab) => tab.value === statusFilter) || visibleStatusTabs[0], [statusFilter, visibleStatusTabs]);

  const backendStatus = useMemo(() => {
    if (!selectedTab || selectedTab.value === "All") return undefined;
    if (selectedTab.match.length === 1) return selectedTab.match[0];
    return undefined;
  }, [selectedTab]);

  const ordersQueryPayload = useMemo(
    () => ({
      status: backendStatus || "All",
      search: debouncedSearch.trim(),
      page,
      limit: PAGE_LIMIT,
      includeCount: true,
      workflow,
    }),
    [backendStatus, debouncedSearch, page, workflow],
  );

  const ordersQueryKey = useMemo(
    () => ["orders", ordersQueryPayload],
    [ordersQueryPayload],
  );

  const {
    data: resData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ordersQueryKey,
    queryFn: () => getOrders(ordersQueryPayload),
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const orders = resData?.data?.data || [];
  const pagination = resData?.data?.pagination;

  const hasRunningTimers = useMemo(() => {
    return orders.some(orderHasRunningTimer);
  }, [orders]);

  useEffect(() => {
    if (!hasRunningTimers) return undefined;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [hasRunningTimers]);

  const invalidateOrders = useCallback(
    async ({ payment = false, table = false } = {}) => {
      await Promise.all(
        [
          queryClient.invalidateQueries({
            queryKey: ["orders"],
            exact: false,
            refetchType: "inactive",
          }),

          queryClient.invalidateQueries({
            queryKey: ["notifications"],
            exact: false,
          }),

          payment &&
            queryClient.invalidateQueries({
              queryKey: ["payments"],
              exact: false,
              refetchType: "inactive",
            }),

          table &&
            queryClient.invalidateQueries({
              queryKey: ["tables"],
              exact: false,
              refetchType: "inactive",
            }),
        ].filter(Boolean),
      );
    },
    [queryClient],
  );

  const filteredOrders = orders;

  const statusCounts =
    resData?.data?.statusCounts || resData?.data?.data?.statusCounts || {};

  const counts = useMemo(() => {
    const result = {};

    STATUS_TABS.forEach((tab) => {
      if (tab.value === "All") {
        result[tab.value] = Number(statusCounts.All || 0);
        return;
      }

      result[tab.value] = tab.match.reduce((sum, status) => {
        return sum + Number(statusCounts[status] || 0);
      }, 0);
    });

    return result;
  }, [statusCounts]);
  const closeCancelModal = useCallback(() => {
    setCancelData(null);
    setCancelReason(CANCELLATION_REASONS[0]);
  }, []);

  const openCustomerModal = useCallback((order) => {
    setCustomerEditData(order);
    setCustomerData({
      name: order.customerDetails?.name || "",
      phone: order.customerDetails?.phone || "",
      guests: order.customerDetails?.guests || 1,
      systemNotes: order.customerDetails?.systemNotes || "",
    });
  }, []);

  const serveMutation = useMutation({
    mutationFn: markItemServed,

    onMutate: async ({ orderId, itemId }) => {
      setServingItemIds((current) => {
        const next = new Set(current);
        next.add(itemId);
        return next;
      });

      await queryClient.cancelQueries({
        queryKey: ["orders"],
        exact: false,
      });

      queryClient.setQueriesData(
        { queryKey: ["orders"], exact: false },
        (old) => {
          if (!old?.data?.data) return old;

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((order) => {
                if (order._id !== orderId) return order;

                return {
                  ...order,
                  items: (order.items || []).map((item) =>
                    item._id === itemId
                      ? {
                          ...item,
                          status: "SERVED",
                          servedAt: new Date().toISOString(),
                        }
                      : item,
                  ),
                };
              }),
            },
          };
        },
      );
    },

    onSuccess: (response) => {
      const updatedOrder = response?.data?.data;

      if (updatedOrder?._id) {
        queryClient.setQueriesData(
          { queryKey: ["orders"], exact: false },
          (old) => {
            if (!old?.data?.data) return old;

            return {
              ...old,
              data: {
                ...old.data,
                data: old.data.data.map((order) =>
                  order._id === updatedOrder._id ? updatedOrder : order,
                ),
              },
            };
          },
        );
      }

      enqueueSnackbar("Item marked as served", { variant: "success" });
    },

    onError: (error) => {
      // Do not restore a whole stale order snapshot: another Serve request may
      // already have succeeded. Fetch the authoritative server state instead.
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });

      enqueueSnackbar(
        error?.response?.data?.message || "Failed to serve item",
        { variant: "error" },
      );
    },

    onSettled: (_data, _error, variables) => {
      setServingItemIds((current) => {
        const next = new Set(current);
        next.delete(variables.itemId);
        return next;
      });
    },
  });

  const customerMutation = useMutation({
    mutationFn: updateCustomerDetails,

    onMutate: async ({ orderId, customerDetails }) => {
      await queryClient.cancelQueries({
        queryKey: ["orders"],
        exact: false,
      });

      const previousOrders = queryClient.getQueryData(ordersQueryKey);

      queryClient.setQueryData(ordersQueryKey, (old) => {
        if (!old?.data?.data) return old;

        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((order) =>
              order._id === orderId
                ? {
                    ...order,
                    customerDetails: {
                      ...order.customerDetails,
                      name: customerDetails.name?.trim() || "Walk-In Customer",
                      phone: customerDetails.phone?.trim() || "",
                      guests: Math.max(Number(customerDetails.guests || 1), 1),
                      systemNotes:
                        customerDetails.systemNotes ||
                        customerDetails.notes ||
                        "",
                    },
                  }
                : order,
            ),
          },
        };
      });

      setCustomerEditData(null);

      return { previousOrders };
    },

    onSuccess: () => {
      enqueueSnackbar("Customer details updated", { variant: "success" });
    },

    onError: (error, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(ordersQueryKey, context.previousOrders);
      }

      enqueueSnackbar(
        error?.response?.data?.message || "Failed to update customer details",
        { variant: "error" },
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
        refetchType: "inactive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      enqueueSnackbar("Order deleted successfully", { variant: "success" });
      invalidateOrders({ payment: true, table: true });
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to delete order",
        { variant: "error" },
      );
    },
  });

  const cancelItemMutation = useMutation({
    mutationFn: cancelItem,
    onSuccess: () => {
      enqueueSnackbar("Item cancelled", { variant: "success" });
      closeCancelModal();
      invalidateOrders();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to cancel item",
        { variant: "error" },
      );
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      enqueueSnackbar("Order cancelled", { variant: "success" });
      closeCancelModal();
      invalidateOrders({ table: true });
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to cancel order",
        { variant: "error" },
      );
    },
  });

  const quantityMutation = useMutation({
    mutationFn: updateItemQuantity,
    onSuccess: () => {
      enqueueSnackbar("Quantity updated", { variant: "success" });
      setQuantityData(null);
      setNewQuantity("");
      invalidateOrders();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message ||
          "Quantity can be changed only before kitchen acceptance",
        { variant: "error" },
      );
    },
  });

  const noteMutation = useMutation({
    mutationFn: updateItemNote,
    onSuccess: () => {
      enqueueSnackbar("Item note updated", { variant: "success" });
      setNoteData(null);
      setSelectedNote("");
      invalidateOrders();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message ||
          "Note can be changed only before kitchen acceptance",
        { variant: "error" },
      );
    },
  });

  const discountMutation = useMutation({
    mutationFn: applyBillDiscount,
    onSuccess: () => {
      enqueueSnackbar("Total amount discount applied", { variant: "success" });
      setDiscountData(null);
      setDiscountType("NONE");
      setDiscountValue("");
      invalidateOrders();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to apply discount",
        { variant: "error" },
      );
    },
  });

  const payMutation = useMutation({
    mutationFn: payOrder,

    onMutate: async ({ orderId, paymentMethod }) => {
      await queryClient.cancelQueries({
        queryKey: ["orders"],
        exact: false,
      });

      const previousOrders = queryClient.getQueryData(ordersQueryKey);

      queryClient.setQueryData(ordersQueryKey, (old) => {
        if (!old?.data?.data) return old;

        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((order) => {
              if (order._id !== orderId) return order;

              const nowDate = new Date().toISOString();

              return {
                ...order,
                paymentStatus: "PAID",
                orderStatus: "COMPLETED",
                paymentMethod,
                paidAmount: Number(order.grandTotal || 0),
                dueAmount: 0,
                completedAt: nowDate,
                items: (order.items || []).map((item) =>
                  item.status === "SERVED"
                    ? {
                        ...item,
                        status: "PAID",
                        paidAt: nowDate,
                      }
                    : item,
                ),
              };
            }),
          },
        };
      });

      setPayData(null);
      setPaymentMethod("Cash");
      setPaymentReference("");

      return { previousOrders };
    },

    onSuccess: (res) => {
      const paidOrder = res?.data?.data;

      enqueueSnackbar("Payment completed", { variant: "success" });

      if (paidOrder) {
        queryClient.setQueryData(ordersQueryKey, (old) => {
          if (!old?.data?.data) return old;

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((order) =>
                order._id === paidOrder._id ? paidOrder : order,
              ),
            },
          };
        });

        setInvoiceOrder(paidOrder);
        setShowInvoice(true);
      }
    },

    onError: (error, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(ordersQueryKey, context.previousOrders);
      }

      enqueueSnackbar(error?.response?.data?.message || "Payment failed", {
        variant: "error",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
        refetchType: "inactive",
      });

      queryClient.invalidateQueries({
        queryKey: ["payments"],
        exact: false,
        refetchType: "inactive",
      });

      queryClient.invalidateQueries({
        queryKey: ["tables"],
        exact: false,
        refetchType: "inactive",
      });
    },
  });

  const handleStatusChange = useCallback(
    (status) => {
      const params = new URLSearchParams(searchParams);
      params.set("status", status);
      params.set("tab", "Orders");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const handleCustomerSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!customerEditData?._id) {
        enqueueSnackbar("Invalid order ID", { variant: "error" });
        return;
      }

      customerMutation.mutate({
        orderId: customerEditData._id,
        customerDetails: customerData,
      });
    },
    [customerEditData, customerData, customerMutation],
  );

  const handleDeleteOrder = useCallback(
    (order) => {
      if (userRole !== "Admin") {
        enqueueSnackbar("Only Admin can delete orders", { variant: "error" });
        return;
      }

      if (!order?._id) {
        enqueueSnackbar("Invalid order ID", { variant: "error" });
        return;
      }

      const confirmed = window.confirm(
        `Delete ${
          order.orderNumber || "this order"
        }?\n\nThis action cannot be undone.`,
      );

      if (!confirmed) return;

      deleteMutation.mutate(order._id);
    },
    [deleteMutation, userRole],
  );

  const handleCancelSubmit = useCallback(() => {
    if (!cancelData) return;

    if (!cancelReason) {
      enqueueSnackbar("Select cancellation reason", { variant: "warning" });
      return;
    }

    if (cancelData.type === "order") {
      cancelOrderMutation.mutate({
        orderId: cancelData.order._id,
        reason: cancelReason,
      });
      return;
    }

    cancelItemMutation.mutate({
      orderId: cancelData.order._id,
      itemId: cancelData.item._id,
      reason: cancelReason,
    });
  }, [cancelData, cancelReason, cancelOrderMutation, cancelItemMutation]);

  const handleQuantitySubmit = useCallback(() => {
    if (!quantityData) return;

    const qty = Number(newQuantity);

    if (!qty || qty <= 0) {
      enqueueSnackbar("Enter valid quantity", { variant: "warning" });
      return;
    }

    quantityMutation.mutate({
      orderId: quantityData.order._id,
      itemId: quantityData.item._id,
      quantity: qty,
    });
  }, [quantityData, newQuantity, quantityMutation]);

  const handleNoteSubmit = useCallback(() => {
    if (!noteData) return;

    noteMutation.mutate({
      orderId: noteData.order._id,
      itemId: noteData.item._id,
      notes: selectedNote,
    });
  }, [noteData, selectedNote, noteMutation]);

  const handleDiscountSubmit = useCallback(() => {
    if (!discountData) return;

    discountMutation.mutate({
      orderId: discountData._id,
      billDiscountType: discountType,
      billDiscountValue: Number(discountValue || 0),
    });
  }, [discountData, discountType, discountValue, discountMutation]);

  const handleAddItems = useCallback(
    (order) => {
      navigate(`/menu?mode=add-items&orderId=${order._id}`);
    },
    [navigate],
  );

  const handleServeItem = useCallback(
    (order, item) => {
      serveMutation.mutate({
        orderId: order._id,
        itemId: item._id,
      });
    },
    [serveMutation],
  );

  const handleOpenCancelItem = useCallback((order, item) => {
    setCancelData({ type: "item", order, item });
    setCancelReason(CANCELLATION_REASONS[0]);
  }, []);

  const handleOpenCancelOrder = useCallback((order) => {
    setCancelData({ type: "order", order });
    setCancelReason(CANCELLATION_REASONS[0]);
  }, []);

  const handleOpenQuantity = useCallback((order, item) => {
    setQuantityData({ order, item });
    setNewQuantity(item.quantity || 1);
  }, []);

  const handleOpenNote = useCallback((order, item) => {
    setNoteData({ order, item });
    setSelectedNote(item.notes || "");
  }, []);

  const handleOpenDiscount = useCallback((order) => {
    setDiscountData(order);
    setDiscountType(order.billDiscountType || "NONE");
    setDiscountValue(order.billDiscountValue || "");
  }, []);

  const handleOpenPay = useCallback((order) => {
    setPayData(order);
    setPaymentMethod("Cash");
    setPaymentReference("");
  }, []);

  const handleViewDetails = useCallback((order) => {
    setDetailsOrder(order);
  }, []);

  const handlePaySubmit = useCallback(async () => {
    if (!payData) return;

    if (Number(payData.grandTotal || 0) <= 0) {
      enqueueSnackbar("No billable items found", { variant: "warning" });
      return;
    }

    if (paymentMethod === "QR" && !paymentReference.trim()) {
      enqueueSnackbar("Enter UPI/QR reference number", { variant: "warning" });
      return;
    }

    if (paymentMethod === "Online") {
      try {
        if (!window.Razorpay) {
          enqueueSnackbar("Razorpay SDK not loaded", { variant: "error" });
          return;
        }

        const razorRes = await createOrderRazorpay({
          amount: Number(payData.grandTotal || 0),
          orderId: payData._id,
          invoiceNo: payData.invoiceNo,
        });

        const razorOrder = razorRes?.data?.order;

        if (!razorOrder?.id) {
          enqueueSnackbar("Unable to create Razorpay order", {
            variant: "error",
          });
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorOrder.amount,
          currency: razorOrder.currency,
          name: "SAS CAFE & RESTAURANT",
          description: payData.orderNumber || payData.invoiceNo,
          order_id: razorOrder.id,

          handler: async (response) => {
            try {
              await verifyPaymentRazorpay({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: payData._id,
                orderNumber: payData.orderNumber,
                invoiceNo: payData.invoiceNo,
                amount: Number(payData.grandTotal || 0),
                contact: payData.customerDetails?.phone || "",
                customerName: payData.customerDetails?.name || "",
              });

              payMutation.mutate({
                orderId: payData._id,
                paymentMethod: "Online",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                paymentReference: response.razorpay_payment_id,
              });
            } catch (error) {
              enqueueSnackbar(
                error?.response?.data?.message ||
                  "Razorpay verification failed",
                { variant: "error" },
              );
            }
          },

          prefill: {
            name: payData.customerDetails?.name || "",
            contact: payData.customerDetails?.phone || "",
          },

          theme: {
            color: "#f6b100",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        enqueueSnackbar(
          error?.response?.data?.message || "Razorpay payment failed",
          { variant: "error" },
        );
      }

      return;
    }

    payMutation.mutate({
      orderId: payData._id,
      paymentMethod,
      paymentReference: paymentReference.trim(),
    });
  }, [payData, paymentMethod, paymentReference, payMutation]);

  const isAnyActionLoading =
    deleteMutation.isPending ||
    customerMutation.isPending ||
    cancelItemMutation.isPending ||
    cancelOrderMutation.isPending ||
    quantityMutation.isPending ||
    noteMutation.isPending ||
    discountMutation.isPending ||
    payMutation.isPending;

  if (isLoading) {
    return (
      <div className="bg-[#262626] rounded-xl p-6 text-white">
        Loading orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#262626] rounded-xl p-6 text-red-400">
        {error?.response?.data?.message || "Failed to load orders"}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div className="bg-[#262626] border border-[#333] rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h2 className="text-[#f5f5f5] text-xl sm:text-2xl font-bold">
                POS Orders
              </h2>

              <p className="text-[#ababab] text-xs sm:text-sm mt-1">
                Serve ready items, modify pending items, apply discounts and
                collect payment.
              </p>

              {isFetching && (
                <p className="text-[#f6b100] text-xs mt-2">
                  Syncing latest orders...
                </p>
              )}
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, invoice, customer, phone, table..."
              className="w-full xl:max-w-[420px] bg-[#1f1f1f] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#f6b100]"
            />
          </div>

          <div className="overflow-x-auto pb-1 mt-4">
            <div className="flex gap-2 min-w-max">
              {visibleStatusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleStatusChange(tab.value)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                    statusFilter === tab.value
                      ? "bg-[#f6b100] text-black"
                      : "bg-[#1f1f1f] text-[#ababab] hover:text-white"
                  }`}
                >
                  {tab.label} ({counts[tab.value] || 0})
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-[#262626] rounded-xl p-8 text-center text-[#ababab]">
            No orders found.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                now={orderHasRunningTimer(order) ? now : undefined}
                userRole={userRole}
                servingItemIds={servingItemIds}
                onAddItems={handleAddItems}
                onServeItem={handleServeItem}
                onCancelItem={handleOpenCancelItem}
                onCancelOrder={handleOpenCancelOrder}
                onDeleteOrder={handleDeleteOrder}
                onUpdateQuantity={handleOpenQuantity}
                onUpdateNote={handleOpenNote}
                onUpdateCustomer={openCustomerModal}
                onDiscount={handleOpenDiscount}
                onPay={handleOpenPay}
                onViewDetails={handleViewDetails}
                onShowInvoice={(order) => {
                  setInvoiceOrder(order);
                  setShowInvoice(true);
                }}
                loading={isAnyActionLoading}
              />
            ))}
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="bg-[#262626] disabled:opacity-50 text-white px-4 py-2 rounded-xl"
            >
              Prev
            </button>

            <p className="text-[#ababab] text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-[#262626] disabled:opacity-50 text-white px-4 py-2 rounded-xl"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {detailsOrder && (
        <DetailsModal
          order={detailsOrder}
          onClose={() => setDetailsOrder(null)}
        />
      )}

      {customerEditData && (
        <CustomerDetailsModal
          order={customerEditData}
          customerData={customerData}
          setCustomerData={setCustomerData}
          onClose={() => setCustomerEditData(null)}
          onSubmit={handleCustomerSubmit}
          loading={customerMutation.isPending}
        />
      )}

      {cancelData && (
        <CancelModal
          cancelData={cancelData}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          onClose={closeCancelModal}
          onSubmit={handleCancelSubmit}
          loading={
            cancelItemMutation.isPending || cancelOrderMutation.isPending
          }
        />
      )}

      {quantityData && (
        <QuantityModal
          quantityData={quantityData}
          newQuantity={newQuantity}
          setNewQuantity={setNewQuantity}
          onClose={() => setQuantityData(null)}
          onSubmit={handleQuantitySubmit}
          loading={quantityMutation.isPending}
        />
      )}

      {noteData && (
        <NoteModal
          noteData={noteData}
          selectedNote={selectedNote}
          setSelectedNote={setSelectedNote}
          onClose={() => setNoteData(null)}
          onSubmit={handleNoteSubmit}
          loading={noteMutation.isPending}
        />
      )}

      {discountData && (
        <DiscountModal
          discountData={discountData}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          onClose={() => setDiscountData(null)}
          onSubmit={handleDiscountSubmit}
          loading={discountMutation.isPending}
        />
      )}

      {payData && (
        <PaymentModal
          payData={payData}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentReference={paymentReference}
          setPaymentReference={setPaymentReference}
          onClose={() => setPayData(null)}
          onSubmit={handlePaySubmit}
          loading={payMutation.isPending}
        />
      )}

      {showInvoice && invoiceOrder && (
        <Invoice
          orderInfo={invoiceOrder}
          setShowInvoice={setShowInvoice}
          clearOrder={() => {
            setInvoiceOrder(null);
          }}
        />
      )}
    </>
  );
};

export default RecentOrders;
