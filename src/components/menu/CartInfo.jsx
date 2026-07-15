// //final kds
// import React, { useEffect, useRef } from "react";
// import { RiDeleteBin2Fill } from "react-icons/ri";
// import { FaNotesMedical } from "react-icons/fa6";
// import { FiMinus, FiPlus } from "react-icons/fi";
// import { useDispatch, useSelector } from "react-redux";

// import {
//   ITEM_NOTE_OPTIONS,
//   decrementCartItem,
//   incrementCartItem,
//   removeItem,
//   updateCartItemNotes,
// } from "../../redux/slices/cartSlice";

// const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

// const CartInfo = () => {
//   const cartData = useSelector((state) => state.cart);
//   const dispatch = useDispatch();
//   const scrollRef = useRef(null);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTo({
//         top: scrollRef.current.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, [cartData]);

//   return (
//     <div className="px-4 py-3">
//       <div className="flex items-center justify-between gap-3">
//         <h1 className="text-base sm:text-lg text-[#e4e4e4] font-semibold tracking-wide">
//           Order Details
//         </h1>

//         <span className="text-xs bg-[#1f1f1f] text-[#ababab] px-3 py-1 rounded-full">
//           {cartData.length} {cartData.length === 1 ? "Item" : "Items"}
//         </span>
//       </div>

//       <div
//         ref={scrollRef}
//         className="mt-4 overflow-y-auto scrollbar-hide h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] pr-1"
//       >
//         {cartData.length === 0 ? (
//           <div className="flex justify-center items-center h-full">
//             <p className="text-[#ababab] text-sm text-center px-4">
//               Your cart is empty. Start adding items!
//             </p>
//           </div>
//         ) : (
//           cartData.map((item) => {
//             const originalPrice = Number(item.originalPrice || item.price || 0);
//             const finalItemPrice = Number(item.finalItemPrice || originalPrice);
//             const quantity = Number(item.quantity || 1);
//             const lineTotal = finalItemPrice * quantity;
//             const discountPercent = Number(item.categoryDiscountPercent || 0);

//             return (
//               <div
//                 key={item.id}
//                 className="bg-[#1f1f1f] rounded-xl p-4 mb-3 border border-[#333]"
//               >
//                 <div className="flex justify-between gap-3">
//                   <div className="min-w-0 flex-1">
//                     <h1 className="text-[#f5f5f5] font-semibold text-sm sm:text-base break-words">
//                       {item.name}
//                     </h1>

//                     {item.categoryName && (
//                       <p className="text-[#ababab] text-xs mt-1">
//                         Category: {item.categoryName}
//                       </p>
//                     )}

//                     <div className="flex flex-wrap items-center gap-2 mt-1">
//                       {discountPercent > 0 ? (
//                         <>
//                           <span className="text-[#777] text-xs line-through">
//                             {formatMoney(originalPrice)}
//                           </span>

//                           <span className="text-green-400 text-xs font-bold">
//                             {discountPercent}% OFF
//                           </span>

//                           <span className="text-[#f6b100] text-xs font-bold">
//                             {formatMoney(finalItemPrice)}
//                           </span>
//                         </>
//                       ) : (
//                         <span className="text-[#ababab] text-xs">
//                           Rate: {formatMoney(originalPrice)}
//                         </span>
//                       )}
//                     </div>

//                     {item.remainingQuantity !== null && (
//                       <p className="text-green-400 text-xs mt-1">
//                         Available today: {item.remainingQuantity}
//                       </p>
//                     )}
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() => dispatch(removeItem(item.id))}
//                     className="text-red-500 hover:text-red-400 shrink-0"
//                     title="Remove item"
//                   >
//                     <RiDeleteBin2Fill size={22} />
//                   </button>
//                 </div>

//                 <div className="flex items-center justify-between gap-3 mt-4">
//                   <div className="flex items-center bg-[#262626] rounded-lg">
//                     <button
//                       type="button"
//                       onClick={() => dispatch(decrementCartItem(item.id))}
//                       className="text-[#f6b100] w-9 h-9 flex items-center justify-center hover:bg-[#333] rounded-l-lg"
//                     >
//                       <FiMinus />
//                     </button>

//                     <span className="text-white font-bold w-10 text-center">
//                       {quantity}
//                     </span>

//                     <button
//                       type="button"
//                       onClick={() => dispatch(incrementCartItem(item.id))}
//                       className="text-[#f6b100] w-9 h-9 flex items-center justify-center hover:bg-[#333] rounded-r-lg"
//                     >
//                       <FiPlus />
//                     </button>
//                   </div>

//                   <div className="text-right">
//                     <p className="text-[#f6b100] font-bold text-sm sm:text-base">
//                       {formatMoney(lineTotal)}
//                     </p>

//                     {discountPercent > 0 && (
//                       <p className="text-green-400 text-xs">
//                         Saved{" "}
//                         {formatMoney(
//                           Number(item.categoryDiscountAmount || 0) * quantity,
//                         )}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <label className="flex items-center gap-2 text-[#ababab] text-xs mb-2">
//                     <FaNotesMedical className="text-[#f6b100]" />
//                     Item Note
//                   </label>

//                   <select
//                     value={item.notes || ""}
//                     onChange={(e) =>
//                       dispatch(
//                         updateCartItemNotes({
//                           id: item.id,
//                           notes: e.target.value,
//                         }),
//                       )
//                     }
//                     className="w-full bg-[#262626] text-white text-sm rounded-lg px-3 py-2 outline-none border border-[#333] focus:border-[#f6b100]"
//                   >
//                     {ITEM_NOTE_OPTIONS.map((note) => (
//                       <option key={note || "none"} value={note}>
//                         {note || "No Note"}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default CartInfo;

import React, { useEffect, useMemo, useRef } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical, FaUtensils, FaBasketShopping } from "react-icons/fa6";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import {
  ITEM_NOTE_OPTIONS,
  decrementCartItem,
  getCategoryDiscountTotal,
  getTotalItems,
  getTotalOriginalPrice,
  getTotalPrice,
  incrementCartItem,
  removeItem,
  updateCartItemNotes,
} from "../../redux/slices/cartSlice";

const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart || []);
  const totalItems = useSelector(getTotalItems);
  const originalTotal = useSelector(getTotalOriginalPrice);
  const discountTotal = useSelector(getCategoryDiscountTotal);
  const finalTotal = useSelector(getTotalPrice);

  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  const hasDiscount = Number(discountTotal || 0) > 0;

  const cartCountLabel = useMemo(() => {
    return `${totalItems} ${totalItems === 1 ? "Item" : "Items"}`;
  }, [totalItems]);

  useEffect(() => {
    if (!scrollRef.current || !cartData.length) return;

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [cartData.length]);

  return (
    <div className="border-t border-[#333] px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#ababab]">
            Order Details
          </p>

          <h1 className="mt-1 text-xl font-black tracking-wide text-[#f5f5f5]">
            Cart
          </h1>
        </div>

        <span className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-black text-black">
          {cartCountLabel}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 max-h-[48vh] overflow-y-auto pr-1 scrollbar-hide xl:max-h-[52vh]"
      >
        {cartData.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-[#444] bg-[#1f1f1f] p-6 text-center">
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                <FaBasketShopping className="text-2xl" />
              </div>

              <h2 className="mt-4 text-lg font-black text-white">
                Cart is empty
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#ababab]">
                Select a dish, choose quantity and note, then add it to cart.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {cartData.map((item) => {
              const originalPrice = Number(
                item.originalPrice || item.price || 0,
              );
              const finalItemPrice = Number(
                item.finalItemPrice || originalPrice,
              );
              const quantity = Number(item.quantity || 1);
              const lineTotal = Number(
                item.finalTotal || finalItemPrice * quantity,
              );
              const discountPercent = Number(item.categoryDiscountPercent || 0);
              const savedAmount =
                Number(item.categoryDiscountAmount || 0) * quantity;

              const canIncrease =
                item.remainingQuantity === null ||
                quantity < Number(item.remainingQuantity || 0);

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[#333] bg-[#1a1a1a] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                          <FaUtensils />
                        </div>

                        <div className="min-w-0">
                          <h1 className="break-words text-sm font-black text-[#f5f5f5] sm:text-base">
                            {item.name}
                          </h1>

                          {item.categoryName && (
                            <p className="mt-1 text-xs font-semibold text-[#ababab]">
                              {item.categoryName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {discountPercent > 0 ? (
                          <>
                            <span className="text-xs text-[#777] line-through">
                              {formatMoney(originalPrice)}
                            </span>

                            <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-black text-green-400">
                              {discountPercent}% OFF
                            </span>

                            <span className="text-xs font-black text-yellow-400">
                              {formatMoney(finalItemPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="rounded-full bg-[#262626] px-3 py-1 text-xs font-bold text-[#ababab]">
                            Rate: {formatMoney(originalPrice)}
                          </span>
                        )}

                        {item.remainingQuantity !== null && (
                          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                            Available: {item.remainingQuantity}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => dispatch(removeItem(item.id))}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 active:scale-[0.96]"
                      title="Remove item"
                    >
                      <RiDeleteBin2Fill size={20} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-2xl bg-[#111] p-1">
                      <button
                        type="button"
                        onClick={() => dispatch(decrementCartItem(item.id))}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#262626] text-yellow-400 active:scale-[0.96]"
                      >
                        <FiMinus />
                      </button>

                      <span className="min-w-11 text-center text-sm font-black text-white">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => dispatch(incrementCartItem(item.id))}
                        disabled={!canIncrease}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-black active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#ababab]">
                        Line Total
                      </p>

                      <p className="text-base font-black text-yellow-400">
                        {formatMoney(lineTotal)}
                      </p>

                      {discountPercent > 0 && (
                        <p className="text-xs font-bold text-green-400">
                          Saved {formatMoney(savedAmount)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold text-[#ababab]">
                      <FaNotesMedical className="text-yellow-400" />
                      Item Note
                    </label>

                    <select
                      value={item.notes || ""}
                      onChange={(e) =>
                        dispatch(
                          updateCartItemNotes({
                            id: item.id,
                            notes: e.target.value,
                          }),
                        )
                      }
                      className="w-full rounded-2xl border border-[#333] bg-[#262626] px-4 py-3 text-sm font-bold text-white outline-none focus:border-yellow-400"
                    >
                      {ITEM_NOTE_OPTIONS.map((note) => (
                        <option key={note || "none"} value={note}>
                          {note || "No Note"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* {cartData.length > 0 && (
        <div className="mt-4 rounded-3xl border border-[#333] bg-[#1a1a1a] p-4">
          <div className="space-y-2">
            <PriceRow
              label="Original Total"
              value={formatMoney(originalTotal)}
            />

            {hasDiscount && (
              <PriceRow
                label="Category Discount"
                value={`- ${formatMoney(discountTotal)}`}
                valueClassName="text-green-400"
              />
            )}

            <div className="border-t border-[#333] pt-3">
              <PriceRow
                label="Cart Total"
                value={formatMoney(finalTotal)}
                labelClassName="text-white"
                valueClassName="text-xl text-yellow-400"
              />
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

const PriceRow = ({
  label,
  value,
  labelClassName = "text-[#ababab]",
  valueClassName = "text-white",
}) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={`text-sm font-bold ${labelClassName}`}>{label}</p>
      <p className={`text-sm font-black ${valueClassName}`}>{value}</p>
    </div>
  );
};

export default CartInfo;
