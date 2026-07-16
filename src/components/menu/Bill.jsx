// // import React, { useState } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { useMutation } from "@tanstack/react-query";
// // import { useNavigate, useSearchParams } from "react-router-dom";
// // import { enqueueSnackbar } from "notistack";

// // import {
// //   addItemsToExistingOrder,
// //   addOrder,
// //   applyBillDiscount,
// //   payOrder,
// // } from "../../https";
// // import {
// //   getCategoryDiscountTotal,
// //   getTotalItems,
// //   getTotalOriginalPrice,
// //   getTotalPrice,
// //   removeAllItems,
// // } from "../../redux/slices/cartSlice";
// // import { removeCustomer } from "../../redux/slices/customerSlice";
// // import PostBillingCheckoutModal from "./PostBillingCheckoutModal";
// // import Invoice from "../invoice/Invoice";

// // const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

// // const Bill = () => {
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();
// //   const [searchParams] = useSearchParams();

// //   const mode = searchParams.get("mode");
// //   const existingOrderId = searchParams.get("orderId");
// //   const isAddItemsMode = mode === "add-items" && existingOrderId;

// //   const customerData = useSelector((state) => state.customer);
// //   const cartData = useSelector((state) => state.cart);
// //   const workflow = useSelector((state) => state.settings.workflow);

// //   const originalTotal = useSelector(getTotalOriginalPrice);
// //   const categoryDiscountTotal = useSelector(getCategoryDiscountTotal);
// //   const cartTotal = useSelector(getTotalPrice);
// //   const totalItems = useSelector(getTotalItems);

// //   const isPostBilling = workflow === "POST_BILLING";
// //   const [checkoutOpen, setCheckoutOpen] = useState(false);
// //   const [showInvoice, setShowInvoice] = useState(false);
// //   const [invoiceOrder, setInvoiceOrder] = useState(null);

// //   const prepareItems = () =>
// //     cartData.map((item) => ({
// //       dishId: item.dishId,
// //       name: item.name,
// //       quantity: Number(item.quantity || 1),
// //       notes: item.notes || "",
// //       estimatedPreparationMinutes: Number(
// //         item.estimatedPreparationMinutes || 10,
// //       ),
// //     }));

// //   const buildOrderData = (customerDetails = null) => {
// //     const orderType = customerData.orderType || "walkin";
// //     const tableId =
// //       customerData.table?.tableId || customerData.table?._id || null;

// //     return {
// //       customerDetails: customerDetails || {
// //         name: customerData.customerName || "",
// //         phone: customerData.customerPhone || "",
// //         systemNotes: customerData.systemNotes || "",
// //         guests: customerData.guests || 1,
// //       },
// //       orderType,
// //       table: orderType === "dinein" ? tableId : null,
// //       items: prepareItems(),
// //     };
// //   };

// //   const validateCartAndTable = () => {
// //     if (!cartData?.length) {
// //       enqueueSnackbar("Cart is empty!", { variant: "warning" });
// //       return false;
// //     }

// //     const orderType = customerData.orderType || "walkin";
// //     const tableId =
// //       customerData.table?.tableId || customerData.table?._id || null;

// //     if (orderType === "dinein" && !tableId) {
// //       enqueueSnackbar("Please select a table for dine-in order", {
// //         variant: "warning",
// //       });
// //       return false;
// //     }

// //     return true;
// //   };

// //   const orderMutation = useMutation({
// //     mutationFn: addOrder,
// //     onSuccess: () => {
// //       enqueueSnackbar("Order sent to kitchen successfully!", {
// //         variant: "success",
// //       });
// //       dispatch(removeCustomer());
// //       dispatch(removeAllItems());
// //       navigate("/orders");
// //     },
// //     onError: (error) => {
// //       enqueueSnackbar(
// //         error?.response?.data?.message || "Failed to send order to kitchen",
// //         { variant: "error" },
// //       );
// //     },
// //   });

// //   const addItemsMutation = useMutation({
// //     mutationFn: addItemsToExistingOrder,
// //     onSuccess: () => {
// //       enqueueSnackbar(
// //         isPostBilling ? "Items added to bill successfully" : "New items sent to kitchen!",
// //         { variant: "success" },
// //       );
// //       dispatch(removeAllItems());
// //       navigate("/orders");
// //     },
// //     onError: (error) => {
// //       enqueueSnackbar(error?.response?.data?.message || "Failed to add items", {
// //         variant: "error",
// //       });
// //     },
// //   });

// //   const checkoutMutation = useMutation({
// //     mutationFn: async (checkoutData) => {
// //       let order = null;

// //       try {
// //         const createResponse = await addOrder(
// //           buildOrderData(checkoutData.customerDetails),
// //         );

// //         order = createResponse?.data?.data;

// //         if (!order?._id) {
// //           throw new Error("Order was created without a valid order ID");
// //         }

// //         const discountResponse = await applyBillDiscount({
// //           orderId: order._id,
// //           billDiscountType: checkoutData.billDiscountType,
// //           billDiscountValue: checkoutData.billDiscountValue,
// //         });

// //         const discountedOrder = discountResponse?.data?.data || order;

// //         const paymentResponse = await payOrder({
// //           orderId: order._id,
// //           paymentMethod: checkoutData.paymentMethod,
// //           paymentReference: checkoutData.paymentReference,
// //         });

// //         return paymentResponse?.data?.data || discountedOrder;
// //       } catch (error) {
// //         if (order?._id) error.createdOrder = order;
// //         throw error;
// //       }
// //     },
// //     onSuccess: (paidOrder) => {
// //       enqueueSnackbar("Payment completed successfully", {
// //         variant: "success",
// //       });

// //       setCheckoutOpen(false);
// //       setInvoiceOrder(paidOrder);
// //       setShowInvoice(true);
// //     },
// //     onError: (error) => {
// //       const orderWasCreated = Boolean(error?.createdOrder?._id);

// //       enqueueSnackbar(
// //         orderWasCreated
// //           ? "Payment was not completed. The open bill was saved in Orders."
// //           : error?.response?.data?.message ||
// //               error?.message ||
// //               "Unable to create and pay the bill.",
// //         { variant: "error" },
// //       );

// //       if (orderWasCreated) {
// //         setCheckoutOpen(false);
// //         dispatch(removeCustomer());
// //         dispatch(removeAllItems());
// //         navigate("/orders?tab=Orders&status=PAYMENT_PENDING");
// //       }
// //     },
// //   });

// //   const handlePrimaryAction = () => {
// //     if (!validateCartAndTable()) return;

// //     if (isAddItemsMode) {
// //       addItemsMutation.mutate({
// //         orderId: existingOrderId,
// //         items: prepareItems(),
// //       });
// //       return;
// //     }

// //     if (isPostBilling) {
// //       setCheckoutOpen(true);
// //       return;
// //     }

// //     orderMutation.mutate(buildOrderData());
// //   };

// //   const isLoading =
// //     orderMutation.isPending ||
// //     addItemsMutation.isPending ||
// //     checkoutMutation.isPending;

// //   return (
// //     <>
// //       <div className="border-t border-[#333] px-4 py-4">
// //         <div className="space-y-3">
// //           <BillRow label="Total Items" value={totalItems} textValue />
// //           <BillRow label="Original Subtotal" value={originalTotal} />
// //           <BillRow
// //             label="Category Discount"
// //             value={categoryDiscountTotal}
// //             discount
// //           />
// //           <BillRow label="Cart Total" value={cartTotal} highlight />

// //           <div className="rounded-lg bg-[#1f1f1f] px-3 py-3 text-xs leading-relaxed text-[#ababab]">
// //             {isPostBilling ? (
// //               <>
// //                 Review customer details, apply a bill discount and collect
// //                 payment directly. The paid invoice opens automatically.
// //               </>
// //             ) : (
// //               <>
// //                 Final bill will be generated only after items are{" "}
// //                 <span className="font-bold text-blue-400">Served</span>.
// //                 Cancelled, rejected, or removed items will never be billed.
// //               </>
// //             )}
// //           </div>

// //           <button
// //             type="button"
// //             disabled={isLoading || cartData.length === 0}
// //             onClick={handlePrimaryAction}
// //             className={`w-full rounded-lg py-3 font-bold transition ${
// //               isLoading || cartData.length === 0
// //                 ? "cursor-not-allowed bg-[#333] text-[#777]"
// //                 : isPostBilling && !isAddItemsMode
// //                   ? "bg-green-500 text-white hover:bg-green-600"
// //                   : "bg-[#f6b100] text-black hover:bg-yellow-500"
// //             }`}
// //           >
// //             {isLoading
// //               ? "Please wait..."
// //               : isAddItemsMode
// //                 ? isPostBilling
// //                   ? "Add Items To Bill"
// //                   : "Send New Items To Kitchen"
// //                 : isPostBilling
// //                   ? `Pay Bill ${formatMoney(cartTotal)}`
// //                   : "Place Order"}
// //           </button>
// //         </div>
// //       </div>

// //       <PostBillingCheckoutModal
// //         key={checkoutOpen ? "open" : "closed"}
// //         open={checkoutOpen}
// //         customerData={customerData}
// //         originalTotal={originalTotal}
// //         categoryDiscountTotal={categoryDiscountTotal}
// //         cartTotal={cartTotal}
// //         totalItems={totalItems}
// //         loading={checkoutMutation.isPending}
// //         onClose={() => {
// //           if (!checkoutMutation.isPending) setCheckoutOpen(false);
// //         }}
// //         onConfirm={(checkoutData) => checkoutMutation.mutate(checkoutData)}
// //       />

// //       {showInvoice && invoiceOrder && (
// //         <Invoice
// //           orderInfo={invoiceOrder}
// //           setShowInvoice={setShowInvoice}
// //           clearOrder={() => {
// //             dispatch(removeCustomer());
// //             dispatch(removeAllItems());
// //             setInvoiceOrder(null);
// //             navigate("/orders?tab=Orders&status=COMPLETED", { replace: true });
// //           }}
// //         />
// //       )}
// //     </>
// //   );
// // };

// // const BillRow = ({ label, value, highlight, discount, textValue }) => (
// //   <div className="flex items-center justify-between gap-3">
// //     <p className="text-sm font-medium text-[#ababab]">{label}</p>
// //     <h1
// //       className={`text-sm font-bold ${
// //         highlight
// //           ? "text-[#f6b100]"
// //           : discount
// //             ? "text-green-400"
// //             : "text-[#f5f5f5]"
// //       }`}
// //     >
// //       {textValue
// //         ? value
// //         : `${discount && Number(value || 0) > 0 ? "-" : ""}${formatMoney(value)}`}
// //     </h1>
// //   </div>
// // );

// // export default Bill;

// import React, { useCallback, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useMutation } from "@tanstack/react-query";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { enqueueSnackbar } from "notistack";

// import { addItemsToExistingOrder, addOrder, payOrder } from "../../https";

// import {
//   getCategoryDiscountTotal,
//   getTotalItems,
//   getTotalOriginalPrice,
//   getTotalPrice,
//   removeAllItems,
// } from "../../redux/slices/cartSlice";

// import { removeCustomer } from "../../redux/slices/customerSlice";
// import Invoice from "../invoice/Invoice";

// const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

// const Bill = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const mode = searchParams.get("mode");
//   const existingOrderId = searchParams.get("orderId");

//   const isAddItemsMode = Boolean(mode === "add-items" && existingOrderId);

//   const customerData = useSelector((state) => state.customer);
//   const cartData = useSelector((state) => state.cart);
//   const workflow = useSelector((state) => state.settings.workflow);

//   const originalTotal = useSelector(getTotalOriginalPrice);
//   const categoryDiscountTotal = useSelector(getCategoryDiscountTotal);
//   const cartTotal = useSelector(getTotalPrice);
//   const totalItems = useSelector(getTotalItems);

//   const isPostBilling = workflow === "POST_BILLING";

//   const [paymentMethod, setPaymentMethod] = useState("Cash");
//   const [showInvoice, setShowInvoice] = useState(false);
//   const [invoiceOrder, setInvoiceOrder] = useState(null);

//   const cartItems = Array.isArray(cartData) ? cartData : [];

//   const preparedItems = useMemo(
//     () =>
//       cartItems.map((item) => ({
//         dishId: item.dishId,
//         name: item.name,
//         quantity: Math.max(Number(item.quantity || 1), 1),
//         notes: item.notes || "",
//         estimatedPreparationMinutes: Math.max(
//           Number(item.estimatedPreparationMinutes || 10),
//           1,
//         ),
//       })),
//     [cartItems],
//   );

//   const buildOrderData = useCallback(
//     (customerDetails = null) => {
//       const orderType = customerData.orderType || "walkin";

//       const tableId =
//         customerData.table?.tableId || customerData.table?._id || null;

//       return {
//         customerDetails: customerDetails || {
//           name: customerData.customerName?.trim() || "Walk-In Customer",
//           phone: customerData.customerPhone?.trim() || "",
//           systemNotes: customerData.systemNotes || "",
//           guests: Math.max(Number(customerData.guests || 1), 1),
//         },

//         orderType,

//         table: orderType === "dinein" ? tableId : null,

//         items: preparedItems,
//       };
//     },
//     [customerData, preparedItems],
//   );

//   const validateCartAndTable = useCallback(() => {
//     if (!cartItems.length) {
//       enqueueSnackbar("Cart is empty!", {
//         variant: "warning",
//       });

//       return false;
//     }

//     const orderType = customerData.orderType || "walkin";

//     const tableId =
//       customerData.table?.tableId || customerData.table?._id || null;

//     if (orderType === "dinein" && !tableId) {
//       enqueueSnackbar("Please select a table for dine-in order", {
//         variant: "warning",
//       });

//       return false;
//     }

//     return true;
//   }, [cartItems.length, customerData]);

//   /*
//    * KITCHEN WORKFLOW
//    *
//    * This flow remains unchanged:
//    * Create order -> send to kitchen -> clear cart -> open Orders.
//    */
//   const orderMutation = useMutation({
//     mutationFn: addOrder,

//     onSuccess: () => {
//       enqueueSnackbar("Order sent to kitchen successfully!", {
//         variant: "success",
//       });

//       dispatch(removeCustomer());
//       dispatch(removeAllItems());

//       navigate("/orders");
//     },

//     onError: (error) => {
//       enqueueSnackbar(
//         error?.response?.data?.message || "Failed to send order to kitchen",
//         {
//           variant: "error",
//         },
//       );
//     },
//   });

//   /*
//    * ADD ITEMS FLOW
//    *
//    * Works for both Kitchen and Post Billing.
//    */
//   const addItemsMutation = useMutation({
//     mutationFn: addItemsToExistingOrder,

//     onSuccess: () => {
//       enqueueSnackbar(
//         isPostBilling
//           ? "Items added to bill successfully"
//           : "New items sent to kitchen!",
//         {
//           variant: "success",
//         },
//       );

//       dispatch(removeAllItems());

//       navigate("/orders");
//     },

//     onError: (error) => {
//       enqueueSnackbar(error?.response?.data?.message || "Failed to add items", {
//         variant: "error",
//       });
//     },
//   });

//   /*
//    * POST BILLING ONLY
//    *
//    * Direct flow:
//    * Create bill -> Pay immediately -> Open invoice
//    *
//    * No intermediate Review & Pay modal.
//    * No separate discount API request.
//    */
//   const checkoutMutation = useMutation({
//     mutationFn: async ({ selectedPaymentMethod }) => {
//       let createdOrder = null;

//       try {
//         const createResponse = await addOrder(buildOrderData());

//         createdOrder = createResponse?.data?.data;

//         if (!createdOrder?._id) {
//           throw new Error("Order was created without a valid order ID");
//         }

//         const paymentReference =
//           selectedPaymentMethod === "QR"
//             ? `QR-${createdOrder._id}-${Date.now()}`
//             : "";

//         const paymentResponse = await payOrder({
//           orderId: createdOrder._id,
//           paymentMethod: selectedPaymentMethod,
//           paymentReference,
//         });

//         const paidOrder = paymentResponse?.data?.data;

//         if (!paidOrder?._id) {
//           throw new Error("Payment completed without valid invoice data");
//         }

//         return paidOrder;
//       } catch (error) {
//         if (createdOrder?._id) {
//           error.createdOrder = createdOrder;
//         }

//         throw error;
//       }
//     },

//     onSuccess: (paidOrder) => {
//       /*
//        * Store invoice data before clearing anything.
//        */
//       setInvoiceOrder(paidOrder);
//       setShowInvoice(true);

//       enqueueSnackbar("Payment completed successfully", {
//         variant: "success",
//       });
//     },

//     onError: (error) => {
//       const orderWasCreated = Boolean(error?.createdOrder?._id);

//       if (orderWasCreated) {
//         enqueueSnackbar(
//           "Bill was created, but payment failed. It was saved under pending orders.",
//           {
//             variant: "error",
//           },
//         );

//         dispatch(removeCustomer());
//         dispatch(removeAllItems());

//         navigate("/orders?tab=Orders&status=PAYMENT_PENDING");

//         return;
//       }

//       enqueueSnackbar(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Unable to create and pay the bill.",
//         {
//           variant: "error",
//         },
//       );
//     },
//   });

//   const handlePrimaryAction = useCallback(() => {
//     if (!validateCartAndTable()) {
//       return;
//     }

//     /*
//      * Add-items mode remains unchanged.
//      */
//     if (isAddItemsMode) {
//       addItemsMutation.mutate({
//         orderId: existingOrderId,
//         items: preparedItems,
//       });

//       return;
//     }

//     /*
//      * Only POST_BILLING uses direct Cash/QR payment.
//      */
//     if (isPostBilling) {
//       checkoutMutation.mutate({
//         selectedPaymentMethod: paymentMethod,
//       });

//       return;
//     }

//     /*
//      * Kitchen workflow remains unchanged.
//      */
//     orderMutation.mutate(buildOrderData());
//   }, [
//     validateCartAndTable,
//     isAddItemsMode,
//     existingOrderId,
//     preparedItems,
//     isPostBilling,
//     paymentMethod,
//     addItemsMutation,
//     checkoutMutation,
//     orderMutation,
//     buildOrderData,
//   ]);

//   const isLoading =
//     orderMutation.isPending ||
//     addItemsMutation.isPending ||
//     checkoutMutation.isPending;

//   const handleInvoiceClose = useCallback(() => {
//     setShowInvoice(false);
//   }, []);

//   const handleInvoiceComplete = useCallback(() => {
//     dispatch(removeCustomer());
//     dispatch(removeAllItems());

//     setInvoiceOrder(null);
//     setShowInvoice(false);

//     navigate("/orders?tab=Orders&status=COMPLETED", {
//       replace: true,
//     });
//   }, [dispatch, navigate]);

//   const buttonText = useMemo(() => {
//     if (isLoading) {
//       if (isPostBilling && !isAddItemsMode) {
//         return "Processing Payment...";
//       }

//       return "Please wait...";
//     }

//     if (isAddItemsMode) {
//       return isPostBilling ? "Add Items To Bill" : "Send New Items To Kitchen";
//     }

//     if (isPostBilling) {
//       return `Pay ${paymentMethod} ${formatMoney(cartTotal)}`;
//     }

//     return "Place Order";
//   }, [isLoading, isPostBilling, isAddItemsMode, paymentMethod, cartTotal]);

//   return (
//     <>
//       <div className="border-t border-[#333] px-4 py-4">
//         <div className="space-y-3">
//           <BillRow label="Total Items" value={totalItems} textValue />

//           <BillRow label="Original Subtotal" value={originalTotal} />

//           <BillRow
//             label="Category Discount"
//             value={categoryDiscountTotal}
//             discount
//           />

//           <BillRow label="Cart Total" value={cartTotal} highlight />

//           {isPostBilling && !isAddItemsMode ? (
//             <div className="space-y-3">
//               <div className="grid grid-cols-2 gap-2">
//                 <PaymentMethodButton
//                   label="Cash"
//                   active={paymentMethod === "Cash"}
//                   disabled={isLoading}
//                   onClick={() => setPaymentMethod("Cash")}
//                 />

//                 <PaymentMethodButton
//                   label="QR"
//                   active={paymentMethod === "QR"}
//                   disabled={isLoading}
//                   onClick={() => setPaymentMethod("QR")}
//                 />
//               </div>

//               <div className="rounded-lg bg-[#1f1f1f] px-3 py-3 text-xs leading-relaxed text-[#ababab]">
//                 Payment will be completed directly using{" "}
//                 <span className="font-bold text-[#f6b100]">
//                   {paymentMethod}
//                 </span>
//                 . The paid invoice will open automatically.
//               </div>
//             </div>
//           ) : (
//             <div className="rounded-lg bg-[#1f1f1f] px-3 py-3 text-xs leading-relaxed text-[#ababab]">
//               {isAddItemsMode && isPostBilling ? (
//                 <>Add selected items to the existing open bill.</>
//               ) : (
//                 <>
//                   Final bill will be generated only after items are{" "}
//                   <span className="font-bold text-blue-400">Served</span>.
//                   Cancelled, rejected, or removed items will never be billed.
//                 </>
//               )}
//             </div>
//           )}

//           <button
//             type="button"
//             disabled={isLoading || cartItems.length === 0}
//             onClick={handlePrimaryAction}
//             className={`w-full rounded-lg py-3 font-bold transition ${
//               isLoading || cartItems.length === 0
//                 ? "cursor-not-allowed bg-[#333] text-[#777]"
//                 : isPostBilling && !isAddItemsMode
//                   ? "bg-green-500 text-white hover:bg-green-600 active:scale-[0.99]"
//                   : "bg-[#f6b100] text-black hover:bg-yellow-500 active:scale-[0.99]"
//             }`}
//           >
//             {buttonText}
//           </button>
//         </div>
//       </div>

//       {showInvoice && invoiceOrder && (
//         <Invoice
//           orderInfo={invoiceOrder}
//           setShowInvoice={handleInvoiceClose}
//           clearOrder={handleInvoiceComplete}
//         />
//       )}
//     </>
//   );
// };

// const PaymentMethodButton = ({ label, active, disabled, onClick }) => (
//   <button
//     type="button"
//     disabled={disabled}
//     onClick={onClick}
//     className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
//       disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
//     } ${
//       active
//         ? "border-[#f6b100] bg-[#f6b100] text-black"
//         : "border-[#444] bg-[#1f1f1f] text-white hover:border-[#f6b100]"
//     }`}
//   >
//     {label}
//   </button>
// );

// const BillRow = ({ label, value, highlight, discount, textValue }) => (
//   <div className="flex items-center justify-between gap-3">
//     <p className="text-sm font-medium text-[#ababab]">{label}</p>

//     <h1
//       className={`text-sm font-bold ${
//         highlight
//           ? "text-[#f6b100]"
//           : discount
//             ? "text-green-400"
//             : "text-[#f5f5f5]"
//       }`}
//     >
//       {textValue
//         ? value
//         : `${
//             discount && Number(value || 0) > 0 ? "-" : ""
//           }${formatMoney(value)}`}
//     </h1>
//   </div>
// );

// export default Bill;

import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

import {
  addItemsToExistingOrder,
  addOrder,
  createAndPayPostBillingOrder,
} from "../../https";

import {
  getCategoryDiscountTotal,
  getTotalItems,
  getTotalOriginalPrice,
  getTotalPrice,
  removeAllItems,
} from "../../redux/slices/cartSlice";

import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";

const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const Bill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get("mode");
  const existingOrderId = searchParams.get("orderId");

  const isAddItemsMode = Boolean(mode === "add-items" && existingOrderId);

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const workflow = useSelector((state) => state.settings.workflow);

  const originalTotal = useSelector(getTotalOriginalPrice);
  const categoryDiscountTotal = useSelector(getCategoryDiscountTotal);
  const cartTotal = useSelector(getTotalPrice);
  const totalItems = useSelector(getTotalItems);

  const isPostBilling = workflow === "POST_BILLING";

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const cartItems = Array.isArray(cartData) ? cartData : [];

  const preparedItems = useMemo(
    () =>
      cartItems.map((item) => ({
        dishId: item.dishId || item._id,
        name: item.name,
        quantity: Math.max(Number(item.quantity || 1), 1),
        notes: item.notes || "",
        estimatedPreparationMinutes: Math.max(
          Number(item.estimatedPreparationMinutes || 10),
          1,
        ),
      })),
    [cartItems],
  );

  const buildOrderData = useCallback(() => {
    const orderType = customerData.orderType || "walkin";

    const tableId =
      customerData.table?.tableId || customerData.table?._id || null;

    return {
      customerDetails: {
        name: customerData.customerName?.trim() || "Walk-In Customer",

        phone: customerData.customerPhone?.trim() || "",

        systemNotes: customerData.systemNotes || "",

        guests: Math.max(Number(customerData.guests || 1), 1),
      },

      orderType,

      table: orderType === "dinein" ? tableId : null,

      items: preparedItems,
    };
  }, [customerData, preparedItems]);

  const validateCartAndTable = useCallback(() => {
    if (!cartItems.length) {
      enqueueSnackbar("Cart is empty!", {
        variant: "warning",
      });

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
  }, [cartItems.length, customerData]);

  /*
   * Kitchen workflow remains unchanged.
   */
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
        {
          variant: "error",
        },
      );
    },
  });

  /*
   * Add items to an existing order.
   */
  const addItemsMutation = useMutation({
    mutationFn: addItemsToExistingOrder,

    onSuccess: () => {
      enqueueSnackbar(
        isPostBilling
          ? "Items added to bill successfully"
          : "New items sent to kitchen!",
        {
          variant: "success",
        },
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

  /*
   * Fast Post Billing flow:
   *
   * One request:
   * create order + complete payment + return invoice.
   */
  const checkoutMutation = useMutation({
    mutationFn: async ({ selectedPaymentMethod }) => {
      const orderData = buildOrderData();

      const response = await createAndPayPostBillingOrder({
        ...orderData,

        paymentMethod: selectedPaymentMethod,

        paymentReference:
          selectedPaymentMethod === "QR" ? `QR-${Date.now()}` : "",
      });

      const paidOrder = response?.data?.data;

      if (!paidOrder?._id) {
        throw new Error("Payment completed without valid invoice data");
      }

      return paidOrder;
    },

    onSuccess: (paidOrder) => {
      /*
       * Save the returned order first so the invoice can open
       * without depending on Redux cart data.
       */
      setInvoiceOrder(paidOrder);
      setShowInvoice(true);

      enqueueSnackbar("Payment completed successfully", {
        variant: "success",
      });
    },

    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to complete payment",
        {
          variant: "error",
        },
      );
    },
  });

  const handlePrimaryAction = useCallback(() => {
    if (!validateCartAndTable()) {
      return;
    }

    if (isAddItemsMode) {
      addItemsMutation.mutate({
        orderId: existingOrderId,
        items: preparedItems,
      });

      return;
    }

    if (isPostBilling) {
      checkoutMutation.mutate({
        selectedPaymentMethod: paymentMethod,
      });

      return;
    }

    orderMutation.mutate(buildOrderData());
  }, [
    validateCartAndTable,
    isAddItemsMode,
    existingOrderId,
    preparedItems,
    isPostBilling,
    paymentMethod,
    addItemsMutation,
    checkoutMutation,
    orderMutation,
    buildOrderData,
  ]);

  const isLoading =
    orderMutation.isPending ||
    addItemsMutation.isPending ||
    checkoutMutation.isPending;

  const handleInvoiceClose = useCallback(() => {
    setShowInvoice(false);
  }, []);

  const handleInvoiceComplete = useCallback(() => {
    dispatch(removeCustomer());
    dispatch(removeAllItems());

    setInvoiceOrder(null);
    setShowInvoice(false);

    navigate("/orders?tab=Orders&status=COMPLETED", {
      replace: true,
    });
  }, [dispatch, navigate]);

  const buttonText = useMemo(() => {
    if (isLoading) {
      if (isPostBilling && !isAddItemsMode) {
        return paymentMethod === "Cash"
          ? "Completing Cash Payment..."
          : "Completing QR Payment...";
      }

      return "Please wait...";
    }

    if (isAddItemsMode) {
      return isPostBilling ? "Add Items To Bill" : "Send New Items To Kitchen";
    }

    if (isPostBilling) {
      return `Pay ${paymentMethod} ${formatMoney(cartTotal)}`;
    }

    return "Place Order";
  }, [isLoading, isPostBilling, isAddItemsMode, paymentMethod, cartTotal]);

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

          {isPostBilling && !isAddItemsMode ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <PaymentMethodButton
                  label="Cash"
                  active={paymentMethod === "Cash"}
                  disabled={isLoading}
                  onClick={() => setPaymentMethod("Cash")}
                />

                <PaymentMethodButton
                  label="QR"
                  active={paymentMethod === "QR"}
                  disabled={isLoading}
                  onClick={() => setPaymentMethod("QR")}
                />
              </div>

              <div className="rounded-lg bg-[#1f1f1f] px-3 py-3 text-xs leading-relaxed text-[#ababab]">
                Payment will be completed directly using{" "}
                <span className="font-bold text-[#f6b100]">
                  {paymentMethod}
                </span>
                . The paid invoice will open automatically.
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-[#1f1f1f] px-3 py-3 text-xs leading-relaxed text-[#ababab]">
              {isAddItemsMode && isPostBilling ? (
                <>Add selected items to the existing open bill.</>
              ) : (
                <>
                  Final bill will be generated only after items are{" "}
                  <span className="font-bold text-blue-400">Served</span>.
                  Cancelled, rejected or removed items will never be billed.
                </>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={isLoading || cartItems.length === 0}
            onClick={handlePrimaryAction}
            className={`w-full rounded-lg py-3 font-bold transition ${
              isLoading || cartItems.length === 0
                ? "cursor-not-allowed bg-[#333] text-[#777]"
                : isPostBilling && !isAddItemsMode
                  ? "bg-green-500 text-white hover:bg-green-600 active:scale-[0.99]"
                  : "bg-[#f6b100] text-black hover:bg-yellow-500 active:scale-[0.99]"
            }`}
          >
            {buttonText}
          </button>
        </div>
      </div>

      {showInvoice && invoiceOrder && (
        <Invoice
          orderInfo={invoiceOrder}
          setShowInvoice={handleInvoiceClose}
          clearOrder={handleInvoiceComplete}
        />
      )}
    </>
  );
};

const PaymentMethodButton = ({ label, active, disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
    } ${
      active
        ? "border-[#f6b100] bg-[#f6b100] text-black"
        : "border-[#444] bg-[#1f1f1f] text-white hover:border-[#f6b100]"
    }`}
  >
    {label}
  </button>
);

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
        : `${
            discount && Number(value || 0) > 0 ? "-" : ""
          }${formatMoney(value)}`}
    </h1>
  </div>
);

export default Bill;
