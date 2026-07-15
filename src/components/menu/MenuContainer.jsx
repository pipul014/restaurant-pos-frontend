// import React, { memo, useCallback, useMemo, useState } from "react";
// import { FaShoppingCart } from "react-icons/fa";
// import { GrRadialSelected } from "react-icons/gr";
// import { useDispatch } from "react-redux";
// import { enqueueSnackbar } from "notistack";
// import { useQuery } from "@tanstack/react-query";

// import { addItems, ITEM_NOTE_OPTIONS } from "../../redux/slices/cartSlice";
// import { getCategories, getDishes } from "../../https";

// const bgColors = [
//   "#b73e3e",
//   "#5b8fb9",
//   "#1f8a70",
//   "#9c6644",
//   "#7b2cbf",
//   "#ff7b00",
//   "#4d908e",
//   "#577590",
// ];

// const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

// const getDishCategoryId = (dish) =>
//   typeof dish.category === "object" ? dish.category?._id : dish.category;

// const getDishStockInfo = (dish) => {
//   const prepared = Number(dish.dailyPreparedQuantity || 0);
//   const sold = Number(dish.dailySoldQuantity || 0);

//   if (prepared <= 0) {
//     return {
//       hasStockLimit: false,
//       remaining: null,
//       isSoldOut: dish.isAvailable === false,
//     };
//   }

//   const remaining = Math.max(prepared - sold, 0);

//   return {
//     hasStockLimit: true,
//     remaining,
//     isSoldOut: remaining <= 0 || dish.isAvailable === false,
//   };
// };

// const getDiscountedPrice = (dish, selectedCategory) => {
//   const category =
//     typeof dish.category === "object" ? dish.category : selectedCategory;

//   const originalPrice = Number(dish.price || 0);
//   const discountPercent = Number(category?.discountPercent || 0);
//   const discountAmount = (originalPrice * discountPercent) / 100;
//   const finalPrice = Math.max(originalPrice - discountAmount, 0);

//   return {
//     category,
//     originalPrice,
//     discountPercent,
//     discountAmount,
//     finalPrice,
//   };
// };

// const MenuContainer = () => {
//   const dispatch = useDispatch();

//   const [selectedCategoryId, setSelectedCategoryId] = useState("");
//   const [selectedDishId, setSelectedDishId] = useState("");
//   const [quantity, setQuantity] = useState(0);
//   const [itemNote, setItemNote] = useState("");

//   const { data: categoryRes, isLoading: categoryLoading } = useQuery({
//     queryKey: ["categories"],
//     queryFn: getCategories,
//     staleTime: 1000 * 60 * 30,
//     gcTime: 1000 * 60 * 60,
//     refetchOnWindowFocus: false,
//   });

//   const { data: dishRes, isLoading: dishLoading } = useQuery({
//     queryKey: ["dishes"],
//     queryFn: getDishes,
//     staleTime: 1000 * 60 * 30,
//     gcTime: 1000 * 60 * 60,
//     refetchOnWindowFocus: false,
//   });

//   const categories = categoryRes?.data?.data || [];
//   const dishes = dishRes?.data?.data || [];

//   const selectedCategory = useMemo(() => {
//     if (!categories.length) return null;

//     return (
//       categories.find((category) => category._id === selectedCategoryId) ||
//       categories[0]
//     );
//   }, [categories, selectedCategoryId]);

//   const dishesByCategory = useMemo(() => {
//     const map = {};

//     for (const dish of dishes) {
//       const categoryId = getDishCategoryId(dish);
//       if (!categoryId) continue;

//       if (!map[categoryId]) map[categoryId] = [];
//       map[categoryId].push(dish);
//     }

//     return map;
//   }, [dishes]);

//   const dishCountMap = useMemo(() => {
//     const map = {};

//     for (const dish of dishes) {
//       const categoryId = getDishCategoryId(dish);
//       if (!categoryId) continue;

//       map[categoryId] = (map[categoryId] || 0) + 1;
//     }

//     return map;
//   }, [dishes]);

//   const selectedDishes = useMemo(() => {
//     if (!selectedCategory?._id) return [];
//     return dishesByCategory[selectedCategory._id] || [];
//   }, [dishesByCategory, selectedCategory]);

//   const resetSelection = useCallback(() => {
//     setSelectedDishId("");
//     setQuantity(0);
//     setItemNote("");
//   }, []);

//   const handleCategorySelect = useCallback(
//     (category) => {
//       setSelectedCategoryId(category._id);
//       resetSelection();
//     },
//     [resetSelection],
//   );

//   const handleSelectDish = useCallback(
//     (dish) => {
//       const stock = getDishStockInfo(dish);

//       if (stock.isSoldOut) {
//         enqueueSnackbar(`${dish.name} is sold out for today`, {
//           variant: "warning",
//         });
//         return;
//       }

//       setSelectedDishId(dish._id);
//       setQuantity((prev) =>
//         selectedDishId === dish._id && prev > 0 ? prev : 1,
//       );
//       setItemNote("");
//     },
//     [selectedDishId],
//   );

//   const increment = useCallback(
//     (dish) => {
//       const stock = getDishStockInfo(dish);

//       if (stock.isSoldOut) {
//         enqueueSnackbar(`${dish.name} is sold out for today`, {
//           variant: "warning",
//         });
//         return;
//       }

//       if (selectedDishId !== dish._id) {
//         setSelectedDishId(dish._id);
//         setQuantity(1);
//         setItemNote("");
//         return;
//       }

//       setQuantity((prev) => {
//         const nextQty = Number(prev || 0) + 1;

//         if (stock.hasStockLimit && nextQty > stock.remaining) {
//           enqueueSnackbar(`Only ${stock.remaining} quantity available today`, {
//             variant: "warning",
//           });
//           return prev;
//         }

//         return Math.min(nextQty, 99);
//       });
//     },
//     [selectedDishId],
//   );

//   const decrement = useCallback(
//     (dish) => {
//       if (selectedDishId !== dish._id) {
//         setSelectedDishId(dish._id);
//         setQuantity(0);
//         setItemNote("");
//         return;
//       }

//       setQuantity((prev) => Math.max(Number(prev || 0) - 1, 0));
//     },
//     [selectedDishId],
//   );

//   const handleAddToCart = useCallback(
//     (dish) => {
//       if (!dish?._id) return;

//       const stock = getDishStockInfo(dish);

//       if (stock.isSoldOut) {
//         enqueueSnackbar(`${dish.name} is sold out for today`, {
//           variant: "warning",
//         });
//         return;
//       }

//       if (quantity <= 0 || selectedDishId !== dish._id) {
//         enqueueSnackbar("Please select quantity first", {
//           variant: "warning",
//         });
//         return;
//       }

//       if (stock.hasStockLimit && quantity > stock.remaining) {
//         enqueueSnackbar(`Only ${stock.remaining} quantity available today`, {
//           variant: "warning",
//         });
//         return;
//       }

//       const {
//         category,
//         originalPrice,
//         discountPercent,
//         discountAmount,
//         finalPrice,
//       } = getDiscountedPrice(dish, selectedCategory);

//       dispatch(
//         addItems({
//           id: `${dish._id}-${Date.now()}`,
//           dishId: dish._id,
//           name: dish.name,
//           image: dish.image || "",

//           category,
//           categoryId: category?._id || null,
//           categoryName: category?.name || "",

//           quantity: Number(quantity || 1),

//           originalPrice,
//           price: originalPrice,
//           pricePerQuantity: originalPrice,

//           categoryDiscountPercent: discountPercent,
//           categoryDiscountAmount: discountAmount,

//           finalItemPrice: finalPrice,
//           finalTotal: finalPrice * Number(quantity || 1),

//           notes: itemNote,

//           estimatedPreparationMinutes: Number(
//             dish.estimatedPreparationMinutes || 10,
//           ),

//           dailyPreparedQuantity: Number(dish.dailyPreparedQuantity || 0),
//           dailySoldQuantity: Number(dish.dailySoldQuantity || 0),
//           isAvailable: dish.isAvailable,
//         }),
//       );

//       enqueueSnackbar(`${dish.name} added to cart`, {
//         variant: "success",
//       });

//       resetSelection();
//     },
//     [
//       dispatch,
//       itemNote,
//       quantity,
//       resetSelection,
//       selectedCategory,
//       selectedDishId,
//     ],
//   );

//   const loading = categoryLoading || dishLoading;

//   if (loading) {
//     return (
//       <div className="rounded-3xl border border-[#333] bg-[#262626] p-6 text-white">
//         Loading menu...
//       </div>
//     );
//   }

//   if (categories.length === 0) {
//     return (
//       <div className="rounded-3xl border border-[#333] bg-[#262626] p-6 text-[#ababab]">
//         No categories found. Please add categories first.
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
//       <aside className="rounded-3xl border border-[#333] bg-[#262626] p-4 xl:sticky xl:top-4 ">
//         <h2 className="mb-3 text-lg font-black text-white">Categories</h2>

//         <div className="flex gap-3 overflow-x-auto pb-2 xl:grid xl:grid-cols-1 xl:overflow-visible xl:pb-0 xl:h-[calc(100vh-145px)] xl:overflow-y-auto scrollbar-hide">
//           {categories.map((category, index) => {
//             const isActive = selectedCategory?._id === category._id;
//             const dishCount = dishCountMap[category._id] || 0;

//             return (
//               <CategoryCard
//                 key={category._id}
//                 category={category}
//                 index={index}
//                 isActive={isActive}
//                 dishCount={dishCount}
//                 onClick={() => handleCategorySelect(category)}
//               />
//             );
//           })}
//         </div>
//       </aside>

//       <main className="min-w-0 rounded-3xl border border-[#333] bg-[#262626] ">
//         <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <h2 className="text-xl font-black text-white sm:text-2xl">
//               {selectedCategory?.name || "Menu Items"}
//             </h2>

//             <p className="mt-1 text-sm text-[#ababab]">
//               Select quantity, choose note, then add to cart.
//             </p>
//           </div>

//           {Number(selectedCategory?.discountPercent || 0) > 0 && (
//             <div className="w-fit rounded-2xl bg-green-500/20 px-4 py-2 text-sm font-black text-green-400">
//               {selectedCategory.discountPercent}% Discount
//             </div>
//           )}
//         </div>

//         <div className="xl:overflow-visible xl:pb-0 xl:h-[calc(100vh-145px)] xl:overflow-y-auto scrollbar-hide overflow-y-auto scrollbar-hide pr-1">
//           {selectedDishes.length === 0 ? (
//             <div className="rounded-2xl bg-[#1f1f1f] p-6 text-[#ababab]">
//               No dishes found in this category.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
//               {selectedDishes.map((dish) => {
//                 const isSelected = selectedDishId === dish._id;
//                 const dishQuantity = isSelected ? quantity : 0;

//                 return (
//                   <DishCard
//                     key={dish._id}
//                     dish={dish}
//                     selectedCategory={selectedCategory}
//                     isSelected={isSelected}
//                     dishQuantity={dishQuantity}
//                     itemNote={itemNote}
//                     setItemNote={setItemNote}
//                     onSelect={() => handleSelectDish(dish)}
//                     onIncrement={() => increment(dish)}
//                     onDecrement={() => decrement(dish)}
//                     onAddToCart={() => handleAddToCart(dish)}
//                   />
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// const CategoryCard = memo(
//   ({ category, index, isActive, dishCount, onClick }) => (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`min-w-[180px] rounded-2xl border p-4 text-left transition active:scale-[0.98] xl:min-w-0 ${
//         isActive
//           ? "border-yellow-400 ring-2 ring-yellow-400/30"
//           : "border-transparent hover:border-[#444]"
//       }`}
//       style={{ backgroundColor: bgColors[index % bgColors.length] }}
//     >
//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <h2 className="break-words text-base font-black text-white">
//             {category.name}
//           </h2>

//           <p className="mt-1 text-xs font-bold text-white/80">
//             {dishCount} {dishCount === 1 ? "dish" : "dishes"}
//           </p>
//         </div>

//         {isActive && (
//           <GrRadialSelected className="shrink-0 text-xl text-white" />
//         )}
//       </div>

//       {Number(category.discountPercent || 0) > 0 && (
//         <span className="mt-3 inline-block rounded-full bg-white/20 px-2 py-1 text-xs font-black text-white">
//           {category.discountPercent}% OFF
//         </span>
//       )}
//     </button>
//   ),
// );

// const DishCard = memo(
//   ({
//     dish,
//     selectedCategory,
//     isSelected,
//     dishQuantity,
//     itemNote,
//     setItemNote,
//     onSelect,
//     onIncrement,
//     onDecrement,
//     onAddToCart,
//   }) => {
//     const stock = useMemo(() => getDishStockInfo(dish), [dish]);

//     const { originalPrice, discountPercent, finalPrice } = useMemo(
//       () => getDiscountedPrice(dish, selectedCategory),
//       [dish, selectedCategory],
//     );

//     return (
//       <div
//         className={`rounded-3xl border bg-[#1f1f1f] p-4 transition ${
//           isSelected ? "border-yellow-400" : "border-[#333] hover:border-[#555]"
//         } ${stock.isSoldOut ? "opacity-60" : ""}`}
//       >
//         <button type="button" onClick={onSelect} className="w-full text-left">
//           <div className="flex justify-between gap-3">
//             <div className="min-w-0">
//               <h3 className="break-words text-base font-black text-white sm:text-lg">
//                 {dish.name}
//               </h3>

//               <p className="mt-1 text-sm text-[#ababab]">
//                 {dish.dishType || "Item"}
//               </p>

//               <p className="mt-1 text-xs text-[#777]">
//                 Prep Time: {dish.estimatedPreparationMinutes || 10} min
//               </p>

//               {stock.hasStockLimit && (
//                 <p
//                   className={`mt-1 text-xs font-black ${
//                     stock.isSoldOut ? "text-red-400" : "text-green-400"
//                   }`}
//                 >
//                   {stock.isSoldOut
//                     ? "Sold out for today"
//                     : `Available today: ${stock.remaining}`}
//                 </p>
//               )}

//               {!stock.hasStockLimit && stock.isSoldOut && (
//                 <p className="mt-1 text-xs font-black text-red-400">
//                   Out of stock
//                 </p>
//               )}
//             </div>

//             <div className="shrink-0 text-right">
//               {discountPercent > 0 ? (
//                 <>
//                   <p className="text-xs text-[#777] line-through">
//                     {formatMoney(originalPrice)}
//                   </p>

//                   <p className="font-black text-yellow-400">
//                     {formatMoney(finalPrice)}
//                   </p>

//                   <p className="text-xs font-black text-green-400">
//                     {discountPercent}% off
//                   </p>
//                 </>
//               ) : (
//                 <p className="font-black text-yellow-400">
//                   {formatMoney(originalPrice)}
//                 </p>
//               )}
//             </div>
//           </div>
//         </button>

//         <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#191919] px-3 py-2">
//           <button
//             type="button"
//             disabled={stock.isSoldOut}
//             onClick={onDecrement}
//             className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl font-black text-yellow-400 hover:bg-[#2a2a2a] disabled:opacity-40"
//           >
//             −
//           </button>

//           <span className="text-base font-black text-white">
//             {dishQuantity}
//           </span>

//           <button
//             type="button"
//             disabled={stock.isSoldOut}
//             onClick={onIncrement}
//             className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl font-black text-yellow-400 hover:bg-[#2a2a2a] disabled:opacity-40"
//           >
//             +
//           </button>
//         </div>

//         {isSelected && dishQuantity > 0 && (
//           <div className="mt-3">
//             <label className="mb-2 block text-xs font-bold text-[#ababab]">
//               Item Note
//             </label>

//             <select
//               value={itemNote}
//               onChange={(e) => setItemNote(e.target.value)}
//               className="w-full rounded-2xl border border-[#333] bg-[#191919] px-3 py-3 text-sm text-white outline-none focus:border-yellow-400"
//             >
//               {ITEM_NOTE_OPTIONS.map((note) => (
//                 <option key={note || "none"} value={note}>
//                   {note || "No Note"}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         <button
//           type="button"
//           onClick={onAddToCart}
//           disabled={!isSelected || dishQuantity <= 0 || stock.isSoldOut}
//           className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-black transition active:scale-[0.98] ${
//             isSelected && dishQuantity > 0 && !stock.isSoldOut
//               ? "bg-yellow-400 text-black"
//               : "cursor-not-allowed bg-[#191919] text-[#777]"
//           }`}
//         >
//           <FaShoppingCart />
//           {stock.isSoldOut ? "Sold Out" : "Add To Cart"}
//         </button>
//       </div>
//     );
//   },
// );

// export default MenuContainer;

import React, { memo, useCallback, useMemo, useState } from "react";
import { FaSearch, FaShoppingCart, FaTimes } from "react-icons/fa";
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { useQuery } from "@tanstack/react-query";

import { addItems, ITEM_NOTE_OPTIONS } from "../../redux/slices/cartSlice";
import { getCategories, getDishes } from "../../https";

const bgColors = [
  "#b73e3e",
  "#5b8fb9",
  "#1f8a70",
  "#9c6644",
  "#7b2cbf",
  "#ff7b00",
  "#4d908e",
  "#577590",
];

const formatMoney = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getDishCategoryId = (dish) =>
  typeof dish.category === "object" ? dish.category?._id : dish.category;

const getDishCategoryName = (dish) =>
  typeof dish.category === "object"
    ? dish.category?.name || ""
    : dish.categoryName || "";

const getDishStockInfo = (dish) => {
  const prepared = Number(dish.dailyPreparedQuantity || 0);

  const sold = Number(dish.dailySoldQuantity || 0);

  if (prepared <= 0) {
    return {
      hasStockLimit: false,
      remaining: null,
      isSoldOut: dish.isAvailable === false,
    };
  }

  const remaining = Math.max(prepared - sold, 0);

  return {
    hasStockLimit: true,
    remaining,
    isSoldOut: remaining <= 0 || dish.isAvailable === false,
  };
};

const getDiscountedPrice = (dish, selectedCategory) => {
  const category =
    typeof dish.category === "object" ? dish.category : selectedCategory;

  const originalPrice = Number(dish.price || 0);

  const discountPercent = Number(category?.discountPercent || 0);

  const discountAmount = (originalPrice * discountPercent) / 100;

  const finalPrice = Math.max(originalPrice - discountAmount, 0);

  return {
    category,
    originalPrice,
    discountPercent,
    discountAmount,
    finalPrice,
  };
};

const MenuContainer = () => {
  const dispatch = useDispatch();

  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [selectedDishId, setSelectedDishId] = useState("");

  const [quantity, setQuantity] = useState(0);

  const [itemNote, setItemNote] = useState("");

  const [searchText, setSearchText] = useState("");

  const {
    data: categoryRes,
    isLoading: categoryLoading,
    isError: categoryError,
    error: categoryErrorData,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: dishRes,
    isLoading: dishLoading,
    isError: dishError,
    error: dishErrorData,
  } = useQuery({
    queryKey: ["dishes"],
    queryFn: getDishes,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const categories = categoryRes?.data?.data || [];

  const dishes = dishRes?.data?.data || [];

  const selectedCategory = useMemo(() => {
    if (!categories.length) {
      return null;
    }

    return (
      categories.find((category) => category._id === selectedCategoryId) ||
      categories[0]
    );
  }, [categories, selectedCategoryId]);

  const dishesByCategory = useMemo(() => {
    const map = {};

    for (const dish of dishes) {
      const categoryId = getDishCategoryId(dish);

      if (!categoryId) continue;

      if (!map[categoryId]) {
        map[categoryId] = [];
      }

      map[categoryId].push(dish);
    }

    return map;
  }, [dishes]);

  const dishCountMap = useMemo(() => {
    const map = {};

    for (const dish of dishes) {
      const categoryId = getDishCategoryId(dish);

      if (!categoryId) continue;

      map[categoryId] = (map[categoryId] || 0) + 1;
    }

    return map;
  }, [dishes]);

  const normalizedSearch = useMemo(
    () => normalizeText(searchText),
    [searchText],
  );

  const isSearching = normalizedSearch.length > 0;

  const visibleDishes = useMemo(() => {
    if (isSearching) {
      return dishes.filter((dish) => {
        const searchableValues = [
          dish.name,
          dish.dishType,
          dish.description,
          getDishCategoryName(dish),
        ];

        return searchableValues.some((value) =>
          normalizeText(value).includes(normalizedSearch),
        );
      });
    }

    if (!selectedCategory?._id) {
      return [];
    }

    return dishesByCategory[selectedCategory._id] || [];
  }, [
    dishes,
    dishesByCategory,
    isSearching,
    normalizedSearch,
    selectedCategory,
  ]);

  const visibleHeading = isSearching
    ? `Search Results (${visibleDishes.length})`
    : selectedCategory?.name || "Menu Items";

  const resetSelection = useCallback(() => {
    setSelectedDishId("");
    setQuantity(0);
    setItemNote("");
  }, []);

  const handleCategorySelect = useCallback(
    (category) => {
      setSelectedCategoryId(category._id);

      setSearchText("");
      resetSelection();
    },
    [resetSelection],
  );

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);

      resetSelection();
    },
    [resetSelection],
  );

  const clearSearch = useCallback(() => {
    setSearchText("");
    resetSelection();
  }, [resetSelection]);

  const handleSelectDish = useCallback(
    (dish) => {
      const stock = getDishStockInfo(dish);

      if (stock.isSoldOut) {
        enqueueSnackbar(`${dish.name} is sold out for today`, {
          variant: "warning",
        });

        return;
      }

      setSelectedDishId(dish._id);

      setQuantity((previous) =>
        selectedDishId === dish._id && previous > 0 ? previous : 1,
      );

      setItemNote("");
    },
    [selectedDishId],
  );

  const increment = useCallback(
    (dish) => {
      const stock = getDishStockInfo(dish);

      if (stock.isSoldOut) {
        enqueueSnackbar(`${dish.name} is sold out for today`, {
          variant: "warning",
        });

        return;
      }

      if (selectedDishId !== dish._id) {
        setSelectedDishId(dish._id);
        setQuantity(1);
        setItemNote("");

        return;
      }

      setQuantity((previous) => {
        const nextQuantity = Number(previous || 0) + 1;

        if (stock.hasStockLimit && nextQuantity > stock.remaining) {
          enqueueSnackbar(`Only ${stock.remaining} quantity available today`, {
            variant: "warning",
          });

          return previous;
        }

        return Math.min(nextQuantity, 99);
      });
    },
    [selectedDishId],
  );

  const decrement = useCallback(
    (dish) => {
      if (selectedDishId !== dish._id) {
        setSelectedDishId(dish._id);
        setQuantity(0);
        setItemNote("");

        return;
      }

      setQuantity((previous) => Math.max(Number(previous || 0) - 1, 0));
    },
    [selectedDishId],
  );

  const handleAddToCart = useCallback(
    (dish) => {
      if (!dish?._id) return;

      const stock = getDishStockInfo(dish);

      if (stock.isSoldOut) {
        enqueueSnackbar(`${dish.name} is sold out for today`, {
          variant: "warning",
        });

        return;
      }

      if (quantity <= 0 || selectedDishId !== dish._id) {
        enqueueSnackbar("Please select quantity first", {
          variant: "warning",
        });

        return;
      }

      if (stock.hasStockLimit && quantity > stock.remaining) {
        enqueueSnackbar(`Only ${stock.remaining} quantity available today`, {
          variant: "warning",
        });

        return;
      }

      const {
        category,
        originalPrice,
        discountPercent,
        discountAmount,
        finalPrice,
      } = getDiscountedPrice(dish, selectedCategory);

      dispatch(
        addItems({
          id: `${dish._id}-${Date.now()}`,
          dishId: dish._id,
          name: dish.name,
          image: dish.image || "",

          category,
          categoryId: category?._id || null,
          categoryName: category?.name || getDishCategoryName(dish) || "",

          quantity: Number(quantity || 1),

          originalPrice,
          price: originalPrice,
          pricePerQuantity: originalPrice,

          categoryDiscountPercent: discountPercent,

          categoryDiscountAmount: discountAmount,

          finalItemPrice: finalPrice,

          finalTotal: finalPrice * Number(quantity || 1),

          notes: itemNote,

          estimatedPreparationMinutes: Number(
            dish.estimatedPreparationMinutes || 10,
          ),

          dailyPreparedQuantity: Number(dish.dailyPreparedQuantity || 0),

          dailySoldQuantity: Number(dish.dailySoldQuantity || 0),

          isAvailable: dish.isAvailable,
        }),
      );

      enqueueSnackbar(`${dish.name} added to cart`, {
        variant: "success",
      });

      resetSelection();
    },
    [
      dispatch,
      itemNote,
      quantity,
      resetSelection,
      selectedCategory,
      selectedDishId,
    ],
  );

  const loading = categoryLoading || dishLoading;

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#333] bg-[#262626] p-6 text-white">
        Loading menu...
      </div>
    );
  }

  if (categoryError || dishError) {
    return (
      <div className="rounded-3xl border border-red-500/40 bg-[#262626] p-6 text-red-400">
        {categoryErrorData?.response?.data?.message ||
          dishErrorData?.response?.data?.message ||
          "Failed to load menu"}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-3xl border border-[#333] bg-[#262626] p-6 text-[#ababab]">
        No categories found. Please add categories first.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-[#333] bg-[#262626] p-4 xl:sticky xl:top-4">
        <h2 className="mb-3 text-lg font-black text-white">Categories</h2>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide xl:grid xl:h-[calc(100vh-145px)] xl:grid-cols-1 xl:overflow-y-auto xl:overflow-x-hidden xl:pb-0">
          {categories.map((category, index) => {
            const isActive = selectedCategory?._id === category._id;

            const dishCount = dishCountMap[category._id] || 0;

            return (
              <CategoryCard
                key={category._id}
                category={category}
                index={index}
                isActive={isActive}
                dishCount={dishCount}
                onClick={() => handleCategorySelect(category)}
              />
            );
          })}
        </div>
      </aside>

      <main className="min-w-0 rounded-3xl border border-[#333] bg-[#262626] p-4">
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-white sm:text-2xl">
                {visibleHeading}
              </h2>

              <p className="mt-1 text-sm text-[#ababab]">
                {isSearching
                  ? "Showing matching dishes from all categories."
                  : "Select quantity, choose note, then add to cart."}
              </p>
            </div>

            {!isSearching &&
              Number(selectedCategory?.discountPercent || 0) > 0 && (
                <div className="w-fit rounded-2xl bg-green-500/20 px-4 py-2 text-sm font-black text-green-400">
                  {selectedCategory.discountPercent}% Discount
                </div>
              )}
          </div>

          <div className="relative mb-5">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-base text-[#8a8a8a]" />

            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search dishes by name, category or type..."
              autoComplete="off"
              className="h-12 w-full rounded-2xl border border-[#3a3a3a] bg-[#191919] pl-11 pr-12 text-sm font-medium text-white outline-none transition placeholder:text-[#777] hover:border-[#4a4a4a] focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />

            {searchText && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8a8a8a] transition hover:bg-[#2a2a2a] hover:text-white"
                aria-label="Clear dish search"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto pr-1 scrollbar-hide xl:h-[calc(100vh-235px)]">
          {visibleDishes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#444] bg-[#1f1f1f] p-8 text-center">
              <FaSearch className="mx-auto text-3xl text-[#666]" />

              <h3 className="mt-3 font-black text-white">No dishes found</h3>

              <p className="mt-1 text-sm text-[#ababab]">
                {isSearching
                  ? `No menu item matches "${searchText.trim()}".`
                  : "No dishes found in this category."}
              </p>

              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-4 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {visibleDishes.map((dish) => {
                const isSelected = selectedDishId === dish._id;

                const dishQuantity = isSelected ? quantity : 0;

                const dishCategory =
                  typeof dish.category === "object"
                    ? dish.category
                    : categories.find(
                        (category) => category._id === getDishCategoryId(dish),
                      ) || selectedCategory;

                return (
                  <DishCard
                    key={dish._id}
                    dish={dish}
                    selectedCategory={dishCategory}
                    isSelected={isSelected}
                    dishQuantity={dishQuantity}
                    itemNote={itemNote}
                    setItemNote={setItemNote}
                    onSelect={() => handleSelectDish(dish)}
                    onIncrement={() => increment(dish)}
                    onDecrement={() => decrement(dish)}
                    onAddToCart={() => handleAddToCart(dish)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const CategoryCard = memo(
  ({ category, index, isActive, dishCount, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[180px] rounded-2xl border p-4 text-left transition active:scale-[0.98] xl:min-w-0 ${
        isActive
          ? "border-yellow-400 ring-2 ring-yellow-400/30"
          : "border-transparent hover:border-[#444]"
      }`}
      style={{
        backgroundColor: bgColors[index % bgColors.length],
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-base font-black text-white">
            {category.name}
          </h2>

          <p className="mt-1 text-xs font-bold text-white/80">
            {dishCount} {dishCount === 1 ? "dish" : "dishes"}
          </p>
        </div>

        {isActive && (
          <GrRadialSelected className="shrink-0 text-xl text-white" />
        )}
      </div>

      {Number(category.discountPercent || 0) > 0 && (
        <span className="mt-3 inline-block rounded-full bg-white/20 px-2 py-1 text-xs font-black text-white">
          {category.discountPercent}% OFF
        </span>
      )}
    </button>
  ),
);

const DishCard = memo(
  ({
    dish,
    selectedCategory,
    isSelected,
    dishQuantity,
    itemNote,
    setItemNote,
    onSelect,
    onIncrement,
    onDecrement,
    onAddToCart,
  }) => {
    const stock = useMemo(() => getDishStockInfo(dish), [dish]);

    const { originalPrice, discountPercent, finalPrice } = useMemo(
      () => getDiscountedPrice(dish, selectedCategory),
      [dish, selectedCategory],
    );

    return (
      <div
        className={`rounded-3xl border bg-[#1f1f1f] p-4 transition ${
          isSelected ? "border-yellow-400" : "border-[#333] hover:border-[#555]"
        } ${stock.isSoldOut ? "opacity-60" : ""}`}
      >
        <button type="button" onClick={onSelect} className="w-full text-left">
          <div className="flex justify-between gap-3">
            <div className="min-w-0">
              <h3 className="break-words text-base font-black text-white sm:text-lg">
                {dish.name}
              </h3>

              <p className="mt-1 text-sm text-[#ababab]">
                {dish.dishType || "Item"}
              </p>

              <p className="mt-1 text-xs text-[#777]">
                Prep Time: {dish.estimatedPreparationMinutes || 10} min
              </p>

              {stock.hasStockLimit && (
                <p
                  className={`mt-1 text-xs font-black ${
                    stock.isSoldOut ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {stock.isSoldOut
                    ? "Sold out for today"
                    : `Available today: ${stock.remaining}`}
                </p>
              )}

              {!stock.hasStockLimit && stock.isSoldOut && (
                <p className="mt-1 text-xs font-black text-red-400">
                  Out of stock
                </p>
              )}

              {dish.description && (
                <p className="mt-2 line-clamp-2 text-xs text-[#777]">
                  {dish.description}
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              {discountPercent > 0 ? (
                <>
                  <p className="text-xs text-[#777] line-through">
                    {formatMoney(originalPrice)}
                  </p>

                  <p className="font-black text-yellow-400">
                    {formatMoney(finalPrice)}
                  </p>

                  <p className="text-xs font-black text-green-400">
                    {discountPercent}% off
                  </p>
                </>
              ) : (
                <p className="font-black text-yellow-400">
                  {formatMoney(originalPrice)}
                </p>
              )}
            </div>
          </div>
        </button>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#191919] px-3 py-2">
          <button
            type="button"
            disabled={stock.isSoldOut}
            onClick={onDecrement}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl font-black text-yellow-400 hover:bg-[#2a2a2a] disabled:opacity-40"
          >
            −
          </button>

          <span className="text-base font-black text-white">
            {dishQuantity}
          </span>

          <button
            type="button"
            disabled={stock.isSoldOut}
            onClick={onIncrement}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl font-black text-yellow-400 hover:bg-[#2a2a2a] disabled:opacity-40"
          >
            +
          </button>
        </div>

        {isSelected && dishQuantity > 0 && (
          <div className="mt-3">
            <label className="mb-2 block text-xs font-bold text-[#ababab]">
              Item Note
            </label>

            <select
              value={itemNote}
              onChange={(event) => setItemNote(event.target.value)}
              className="w-full rounded-2xl border border-[#333] bg-[#191919] px-3 py-3 text-sm text-white outline-none focus:border-yellow-400"
            >
              {ITEM_NOTE_OPTIONS.map((note) => (
                <option key={note || "none"} value={note}>
                  {note || "No Note"}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={onAddToCart}
          disabled={!isSelected || dishQuantity <= 0 || stock.isSoldOut}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-black transition active:scale-[0.98] ${
            isSelected && dishQuantity > 0 && !stock.isSoldOut
              ? "bg-yellow-400 text-black"
              : "cursor-not-allowed bg-[#191919] text-[#777]"
          }`}
        >
          <FaShoppingCart />

          {stock.isSoldOut ? "Sold Out" : "Add To Cart"}
        </button>
      </div>
    );
  },
);

CategoryCard.displayName = "CategoryCard";

DishCard.displayName = "DishCard";

export default MenuContainer;
