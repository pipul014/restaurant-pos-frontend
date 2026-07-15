import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

import {
  addItemsToExistingOrder,
  addOrder,
  applyBillDiscount,
  payOrder,
} from "../../https";
import {
  getCategoryDiscountTotal,
  getTotalItems,
  getTotalOriginalPrice,
  getTotalPrice,
  removeAllItems,
} from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import PostBillingCheckoutModal from "./PostBillingCheckoutModal";
import Invoice from "../invoice/Invoice";

const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const Bill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get("mode");
  const existingOrderId = searchParams.get("orderId");
  const isAddItemsMode = mode === "add-items" && existingOrderId;

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const workflow = useSelector((state) => state.settings.workflow);

  const originalTotal = useSelector(getTotalOriginalPrice);
  const categoryDiscountTotal = useSelector(getCategoryDiscountTotal);
  const cartTotal = useSelector(getTotalPrice);
  const totalItems = useSelector(getTotalItems);

  const isPostBilling = workflow === "POST_BILLING";
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const prepareItems = () =>
    cartData.map((item) => ({
      dishId: item.dishId,
      name: item.name,
      quantity: Number(item.quantity || 1),
      notes: item.notes || "",
      estimatedPreparationMinutes: Number(
        item.estimatedPreparationMinutes || 10,
      ),
    }));

  const buildOrderData = (customerDetails = null) => {
    const orderType = customerData.orderType || "walkin";
    const tableId =
      customerData.table?.tableId || customerData.table?._id || null;

    return {
      customerDetails: customerDetails || {
        name: customerData.customerName || "",
        phone: customerData.customerPhone || "",
        systemNotes: customerData.systemNotes || "",
        guests: customerData.guests || 1,
      },
      orderType,
      table: orderType === "dinein" ? tableId : null,
      items: prepareItems(),
    };
  };

  const validateCartAndTable = () => {
    if (!cartData?.length) {
      enqueueSnackbar("Cart is empty!", { variant: "warning" });
      return false;
    }

    const orderType = customerData.orderType || "walkin";
    const tableId =
      customerData.table?.tableId || customerData.table?._id || null;

    if (orderType === "dinein" && !tableId) {
      enqueueSnackbar("Please select a table for dine-in order", {
        variant: "warning",
      });
      return false;
    }

    return true;
  };

  const orderMutation = useMutation({
    mutationFn: addOrder,
    onSuccess: () => {
      enqueueSnackbar("Order sent to kitchen successfully!", {
        variant: "success",
      });
      dispatch(removeCustomer());
      dispatch(removeAllItems());
      navigate("/orders");
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to send order to kitchen",
        { variant: "error" },
      );
    },
  });

  const addItemsMutation = useMutation({
    mutationFn: addItemsToExistingOrder,
    onSuccess: () => {
      enqueueSnackbar(
        isPostBilling ? "Items added to bill successfully" : "New items sent to kitchen!",
        { variant: "success" },
      );
      dispatch(removeAllItems());
      navigate("/orders");
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to add items", {
        variant: "error",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (checkoutData) => {
      let order = null;

      try {
        const createResponse = await addOrder(
          buildOrderData(checkoutData.customerDetails),
        );

        order = createResponse?.data?.data;

        if (!order?._id) {
          throw new Error("Order was created without a valid order ID");
        }

        const discountResponse = await applyBillDiscount({
          orderId: order._id,
          billDiscountType: checkoutData.billDiscountType,
          billDiscountValue: checkoutData.billDiscountValue,
        });

        const discountedOrder = discountResponse?.data?.data || order;

        const paymentResponse = await payOrder({
          orderId: order._id,
          paymentMethod: checkoutData.paymentMethod,
          paymentReference: checkoutData.paymentReference,
        });

        return paymentResponse?.data?.data || discountedOrder;
      } catch (error) {
        if (order?._id) error.createdOrder = order;
        throw error;
      }
    },
    onSuccess: (paidOrder) => {
      enqueueSnackbar("Payment completed successfully", {
        variant: "success",
      });

      setCheckoutOpen(false);
      setInvoiceOrder(paidOrder);
      setShowInvoice(true);
    },
    onError: (error) => {
      const orderWasCreated = Boolean(error?.createdOrder?._id);

      enqueueSnackbar(
        orderWasCreated
          ? "Payment was not completed. The open bill was saved in Orders."
          : error?.response?.data?.message ||
              error?.message ||
              "Unable to create and pay the bill.",
        { variant: "error" },
      );

      if (orderWasCreated) {
        setCheckoutOpen(false);
        dispatch(removeCustomer());
        dispatch(removeAllItems());
        navigate("/orders?tab=Orders&status=PAYMENT_PENDING");
      }
    },
  });

  const handlePrimaryAction = () => {
    if (!validateCartAndTable()) return;

    if (isAddItemsMode) {
      addItemsMutation.mutate({
        orderId: existingOrderId,
        items: prepareItems(),
      });
      return;
    }

    if (isPostBilling) {
      setCheckoutOpen(true);
      return;
    }

    orderMutation.mutate(buildOrderData());
  };

  const isLoading =
    orderMutation.isPending ||
    addItemsMutation.isPending ||
    checkoutMutation.isPending;

  return (
    <>
      <div className="border-t border-[#333] px-4 py-4">
        <div className="space-y-3">
          <BillRow label="Total Items" value={totalItems} textValue />
          <BillRow label="Original Subtotal" value={originalTotal} />
          <BillRow
            label="Category Discount"
            value={categoryDiscountTotal}
            discount
          />
          <BillRow label="Cart Total" value={cartTotal} highlight />

          <div className="rounded-lg bg-[#1f1f1f] px-3 py-3 text-xs leading-relaxed text-[#ababab]">
            {isPostBilling ? (
              <>
                Review customer details, apply a bill discount and collect
                payment directly. The paid invoice opens automatically.
              </>
            ) : (
              <>
                Final bill will be generated only after items are{" "}
                <span className="font-bold text-blue-400">Served</span>.
                Cancelled, rejected, or removed items will never be billed.
              </>
            )}
          </div>

          <button
            type="button"
            disabled={isLoading || cartData.length === 0}
            onClick={handlePrimaryAction}
            className={`w-full rounded-lg py-3 font-bold transition ${
              isLoading || cartData.length === 0
                ? "cursor-not-allowed bg-[#333] text-[#777]"
                : isPostBilling && !isAddItemsMode
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-[#f6b100] text-black hover:bg-yellow-500"
            }`}
          >
            {isLoading
              ? "Please wait..."
              : isAddItemsMode
                ? isPostBilling
                  ? "Add Items To Bill"
                  : "Send New Items To Kitchen"
                : isPostBilling
                  ? `Pay Bill ${formatMoney(cartTotal)}`
                  : "Place Order"}
          </button>
        </div>
      </div>

      <PostBillingCheckoutModal
        key={checkoutOpen ? "open" : "closed"}
        open={checkoutOpen}
        customerData={customerData}
        originalTotal={originalTotal}
        categoryDiscountTotal={categoryDiscountTotal}
        cartTotal={cartTotal}
        totalItems={totalItems}
        loading={checkoutMutation.isPending}
        onClose={() => {
          if (!checkoutMutation.isPending) setCheckoutOpen(false);
        }}
        onConfirm={(checkoutData) => checkoutMutation.mutate(checkoutData)}
      />

      {showInvoice && invoiceOrder && (
        <Invoice
          orderInfo={invoiceOrder}
          setShowInvoice={setShowInvoice}
          clearOrder={() => {
            dispatch(removeCustomer());
            dispatch(removeAllItems());
            setInvoiceOrder(null);
            navigate("/orders?tab=Orders&status=COMPLETED", { replace: true });
          }}
        />
      )}
    </>
  );
};

const BillRow = ({ label, value, highlight, discount, textValue }) => (
  <div className="flex items-center justify-between gap-3">
    <p className="text-sm font-medium text-[#ababab]">{label}</p>
    <h1
      className={`text-sm font-bold ${
        highlight
          ? "text-[#f6b100]"
          : discount
            ? "text-green-400"
            : "text-[#f5f5f5]"
      }`}
    >
      {textValue
        ? value
        : `${discount && Number(value || 0) > 0 ? "-" : ""}${formatMoney(value)}`}
    </h1>
  </div>
);

export default Bill;
