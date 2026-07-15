// import React, { useEffect, useState } from "react";
// import BottomNav from "../components/shared/BottomNav";
// import BackButton from "../components/shared/BackButton";
// import { MdRestaurantMenu } from "react-icons/md";
// import MenuContainer from "../components/menu/MenuContainer";
// import CustomerInfo from "../components/menu/CustomerInfo";
// import CartInfo from "../components/menu/CartInfo";
// import Bill from "../components/menu/Bill";
// import { useSelector } from "react-redux";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { getOrderById } from "../https";
// import { enqueueSnackbar } from "notistack";

// const Menu = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const customerData = useSelector((state) => state.customer);

//   const mode = searchParams.get("mode");
//   const existingOrderId = searchParams.get("orderId");

//   const isAddItemsMode = mode === "add-items" && existingOrderId;

//   const [existingOrder, setExistingOrder] = useState(null);
//   const [loadingExistingOrder, setLoadingExistingOrder] = useState(false);

//   useEffect(() => {
//     document.title = isAddItemsMode ? "POS | Add Items" : "POS | Menu";
//   }, [isAddItemsMode]);

//   useEffect(() => {
//     const fetchExistingOrder = async () => {
//       try {
//         if (!isAddItemsMode) return;

//         setLoadingExistingOrder(true);

//         const { data } = await getOrderById(existingOrderId);
//         setExistingOrder(data?.data);
//       } catch (error) {
//         console.log(error);

//         enqueueSnackbar(
//           error?.response?.data?.message || "Failed to load existing order",
//           { variant: "error" },
//         );

//         navigate("/orders");
//       } finally {
//         setLoadingExistingOrder(false);
//       }
//     };

//     fetchExistingOrder();
//   }, [isAddItemsMode, existingOrderId, navigate]);

//   useEffect(() => {
//     if (!isAddItemsMode && !customerData?.orderId) {
//       navigate("/");
//     }
//   }, [isAddItemsMode, customerData?.orderId, navigate]);

//   if (loadingExistingOrder) {
//     return (
//       <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
//         <div className="bg-[#262626] rounded-xl p-6 text-center">
//           <h1 className="text-white text-xl sm:text-2xl font-bold">
//             Loading existing order...
//           </h1>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-24">
//       <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px] gap-4 px-4 sm:px-6 lg:px-8 py-4">
//         <div className="min-w-0">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
//             <div className="flex items-center gap-4">
//               <BackButton />

//               <div>
//                 <h1 className="text-[#f5f5f5] text-2xl sm:text-3xl font-bold tracking-wider">
//                   {isAddItemsMode ? "Add Items" : "Menu"}
//                 </h1>

//                 <p className="text-[#ababab] text-sm mt-1">
//                   {isAddItemsMode
//                     ? "Add new items to same invoice"
//                     : "Select dishes for customer"}
//                 </p>
//               </div>
//             </div>

//             <div className="hidden sm:flex items-center gap-3 bg-[#262626] rounded-xl px-4 py-3 border border-[#333]">
//               <MdRestaurantMenu className="text-[#f5f5f5] text-3xl shrink-0" />

//               <div className="flex flex-col items-start min-w-0">
//                 <h1 className="text-sm sm:text-base text-[#f5f5f5] font-semibold">
//                   {isAddItemsMode ? "Existing Bill" : "Restaurant Menu"}
//                 </h1>

//                 <p className="text-xs text-[#ababab] font-medium">
//                   {isAddItemsMode
//                     ? "Continue existing invoice"
//                     : "Choose category-wise dishes"}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {isAddItemsMode && existingOrder && (
//             <ExistingOrderInfo existingOrder={existingOrder} />
//           )}

//           {!isAddItemsMode && (
//             <div className="xl:hidden mb-4">
//               <CustomerInfo />
//             </div>
//           )}

//           <div className="min-w-0">
//             <MenuContainer />
//           </div>
//         </div>

//         <aside className="bg-[#262626] rounded-xl border border-[#333] h-fit xl:sticky xl:top-4 overflow-hidden">
//           {isAddItemsMode && existingOrder ? (
//             <div className="px-4 sm:px-5 py-4 border-b border-gray-700">
//               <p className="text-[#ababab] text-xs">Customer Name</p>

//               <h1 className="text-[#f5f5f5] text-lg font-bold break-words">
//                 {existingOrder.customerDetails?.name || "Walk-In Customer"}
//               </h1>

//               <p className="text-[#ababab] text-xs mt-1">
//                 {existingOrder.table?.tableNo
//                   ? `Dine-In / Table ${existingOrder.table.tableNo}`
//                   : "Walk-In"}
//               </p>
//             </div>
//           ) : (
//             <div className="hidden xl:block">
//               <CustomerInfo />
//             </div>
//           )}

//           <CartInfo />
//           <Bill />
//         </aside>
//       </div>

//       <BottomNav />
//     </section>
//   );
// };

// const ExistingOrderInfo = ({ existingOrder }) => {
//   return (
//     <div className="mb-4 bg-[#262626] rounded-xl p-4 text-white border border-[#333]">
//       <h2 className="text-yellow-400 font-bold text-base sm:text-lg">
//         Add Items To Existing Bill
//       </h2>

//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3 text-sm">
//         <InfoItem label="Invoice" value={existingOrder.invoiceNo} />

//         <InfoItem
//           label="Customer"
//           value={existingOrder.customerDetails?.name || "Walk-In Customer"}
//         />

//         <InfoItem
//           label="Phone"
//           value={existingOrder.customerDetails?.phone || "N/A"}
//         />

//         <InfoItem
//           label="Current Total"
//           value={`₹${Number(existingOrder.bills?.total || 0).toFixed(2)}`}
//         />

//         <InfoItem
//           label="Items Already Added"
//           value={existingOrder.items?.length || 0}
//         />

//         <InfoItem
//           label="Type"
//           value={
//             existingOrder.table?.tableNo
//               ? `Dine-In / Table ${existingOrder.table.tableNo}`
//               : "Walk-In"
//           }
//         />
//       </div>
//     </div>
//   );
// };

// const InfoItem = ({ label, value }) => {
//   return (
//     <div className="bg-[#1f1f1f] p-3 rounded-lg min-w-0">
//       <p className="text-[#ababab] text-xs">{label}</p>

//       <p className="text-white font-semibold mt-1 break-words">
//         {value || "N/A"}
//       </p>
//     </div>
//   );
// };

// export default Menu;

import React, { useEffect, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getOrderById } from "../https";
import { enqueueSnackbar } from "notistack";

const Menu = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerData = useSelector((state) => state.customer);

  const mode = searchParams.get("mode");
  const existingOrderId = searchParams.get("orderId");
  const isAddItemsMode = mode === "add-items" && existingOrderId;

  const [existingOrder, setExistingOrder] = useState(null);
  const [loadingExistingOrder, setLoadingExistingOrder] = useState(false);

  useEffect(() => {
    document.title = isAddItemsMode ? "POS | Add Items" : "POS | Menu";
  }, [isAddItemsMode]);

  useEffect(() => {
    const fetchExistingOrder = async () => {
      try {
        if (!isAddItemsMode) return;

        setLoadingExistingOrder(true);

        const { data } = await getOrderById(existingOrderId);
        setExistingOrder(data?.data);
      } catch (error) {
        enqueueSnackbar(
          error?.response?.data?.message || "Failed to load existing order",
          { variant: "error" },
        );

        navigate("/orders");
      } finally {
        setLoadingExistingOrder(false);
      }
    };

    fetchExistingOrder();
  }, [isAddItemsMode, existingOrderId, navigate]);

  useEffect(() => {
    if (!isAddItemsMode && !customerData?.orderId) {
      navigate("/");
    }
  }, [isAddItemsMode, customerData?.orderId, navigate]);

  if (loadingExistingOrder) {
    return (
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#1f1f1f] px-4">
        <div className="rounded-3xl border border-[#333] bg-[#262626] p-6 text-center shadow-2xl">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#333] border-t-yellow-400" />

          <h1 className="mt-5 text-xl font-black text-white sm:text-2xl">
            Loading existing order...
          </h1>

          <p className="mt-2 text-sm text-[#ababab]">
            Preparing the existing bill details.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#1f1f1f] pb-24">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <BackButton />

            <div>
              <h1 className="text-2xl font-black tracking-wide text-[#f5f5f5] sm:text-3xl">
                {isAddItemsMode ? "Add Items" : "Menu"}
              </h1>

              <p className="mt-1 text-sm text-[#ababab]">
                {isAddItemsMode
                  ? "Add new items to the same invoice"
                  : "Select dishes, quantity, notes and add to cart"}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 rounded-2xl border border-[#333] bg-[#262626] px-4 py-3 shadow-sm sm:flex">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-black">
              <MdRestaurantMenu className="text-2xl" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm font-black text-[#f5f5f5] sm:text-base">
                {isAddItemsMode ? "Existing Bill" : "Restaurant Menu"}
              </h1>

              <p className="text-xs font-medium text-[#ababab]">
                {isAddItemsMode
                  ? "Continue existing invoice"
                  : "Category-wise dishes"}
              </p>
            </div>
          </div>
        </div>

        {isAddItemsMode && existingOrder && (
          <ExistingOrderInfo existingOrder={existingOrder} />
        )}

        {!isAddItemsMode && (
          <div className="mb-4 xl:hidden">
            <CustomerInfo />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1fr)_430px]">
          <main className="min-w-0">
            <MenuContainer />
          </main>

          <aside className="h-fit overflow-hidden rounded-3xl border border-[#333] bg-[#262626] shadow-xl xl:sticky xl:top-4">
            {isAddItemsMode && existingOrder ? (
              <div className="border-b border-[#333] px-4 py-4 sm:px-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#ababab]">
                  Customer Name
                </p>

                <h1 className="mt-1 break-words text-lg font-black text-[#f5f5f5]">
                  {existingOrder.customerDetails?.name || "Walk-In Customer"}
                </h1>

                <p className="mt-1 text-xs text-[#ababab]">
                  {existingOrder.table?.tableNo
                    ? `Dine-In / Table ${existingOrder.table.tableNo}`
                    : "Walk-In"}
                </p>
              </div>
            ) : (
              <div className="hidden xl:block">
                <CustomerInfo />
              </div>
            )}

            <CartInfo />
            <Bill />
          </aside>
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

const ExistingOrderInfo = ({ existingOrder }) => {
  const currentTotal =
    existingOrder.grandTotal ??
    existingOrder.bills?.total ??
    existingOrder.total ??
    0;

  return (
    <div className="mb-4 rounded-3xl border border-[#333] bg-[#262626] p-4 text-white shadow-sm">
      <h2 className="text-base font-black text-yellow-400 sm:text-lg">
        Add Items To Existing Bill
      </h2>

      <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
        <InfoItem label="Invoice" value={existingOrder.invoiceNo} />

        <InfoItem
          label="Customer"
          value={existingOrder.customerDetails?.name || "Walk-In Customer"}
        />

        <InfoItem
          label="Phone"
          value={existingOrder.customerDetails?.phone || "N/A"}
        />

        <InfoItem
          label="Current Total"
          value={`₹${Number(currentTotal || 0).toFixed(2)}`}
        />

        <InfoItem
          label="Items Already Added"
          value={existingOrder.items?.length || 0}
        />

        <InfoItem
          label="Type"
          value={
            existingOrder.table?.tableNo
              ? `Dine-In / Table ${existingOrder.table.tableNo}`
              : "Walk-In"
          }
        />
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => {
  return (
    <div className="min-w-0 rounded-2xl bg-[#1f1f1f] p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[#ababab]">
        {label}
      </p>

      <p className="mt-1 break-words font-black text-white">{value || "N/A"}</p>
    </div>
  );
};

export default Menu;
