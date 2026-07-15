// //final kds
// import { createSlice } from "@reduxjs/toolkit";

// export const ITEM_NOTE_OPTIONS = [
//   "",
//   "Less Spicy",
//   "No Onion",
//   "Extra Cheese",
//   "No Sugar",
//   "Extra Sauce",
// ];

// const initialState = [];

// const getCategory = (item) => {
//   if (typeof item.category === "object" && item.category !== null) {
//     return item.category;
//   }

//   return item.categoryData || null;
// };

// const normalizeCartItem = (item) => {
//   const category = getCategory(item);

//   const quantity = Number(item.quantity || 1);
//   const originalPrice = Number(
//     item.originalPrice || item.price || item.pricePerQuantity || 0,
//   );

//   const categoryDiscountPercent = Number(
//     item.categoryDiscountPercent ||
//       category?.discountPercent ||
//       item.discountPercent ||
//       0,
//   );

//   const categoryDiscountAmount =
//     (originalPrice * categoryDiscountPercent) / 100;

//   const finalItemPrice = Math.max(originalPrice - categoryDiscountAmount, 0);

//   const notes = ITEM_NOTE_OPTIONS.includes(item.notes || "")
//     ? item.notes || ""
//     : "";

//   return {
//     id: String(item.id || `${item._id || item.dishId}-${Date.now()}`),

//     dishId: item.dishId || item._id || null,
//     name: item.name || "",
//     image: item.image || "",

//     categoryId: category?._id || item.categoryId || null,
//     categoryName: category?.name || item.categoryName || "",

//     quantity,

//     originalPrice,
//     price: originalPrice,
//     pricePerQuantity: originalPrice,

//     categoryDiscountPercent,
//     categoryDiscountAmount,

//     finalItemPrice,
//     finalTotal: finalItemPrice * quantity,

//     notes,

//     estimatedPreparationMinutes: Number(item.estimatedPreparationMinutes || 10),

//     dailyPreparedQuantity: Number(item.dailyPreparedQuantity || 0),
//     dailySoldQuantity: Number(item.dailySoldQuantity || 0),
//     remainingQuantity:
//       Number(item.dailyPreparedQuantity || 0) > 0
//         ? Math.max(
//             Number(item.dailyPreparedQuantity || 0) -
//               Number(item.dailySoldQuantity || 0),
//             0,
//           )
//         : null,

//     isAvailable: item.isAvailable !== false,
//     isSoldOut:
//       Number(item.dailyPreparedQuantity || 0) > 0 &&
//       Number(item.dailySoldQuantity || 0) >=
//         Number(item.dailyPreparedQuantity || 0),
//   };
// };

// const recalculateItem = (item) => {
//   item.categoryDiscountAmount =
//     (Number(item.originalPrice || 0) *
//       Number(item.categoryDiscountPercent || 0)) /
//     100;

//   item.finalItemPrice = Math.max(
//     Number(item.originalPrice || 0) - Number(item.categoryDiscountAmount || 0),
//     0,
//   );

//   item.finalTotal =
//     Number(item.finalItemPrice || 0) * Number(item.quantity || 1);
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addItems: (state, action) => {
//       const newItem = normalizeCartItem(action.payload);

//       if (!newItem.isAvailable || newItem.isSoldOut) {
//         return;
//       }

//       const existingItem = state.find(
//         (item) =>
//           String(item.dishId) === String(newItem.dishId) &&
//           (item.notes || "") === (newItem.notes || ""),
//       );

//       if (existingItem) {
//         const nextQty = Number(existingItem.quantity || 1) + newItem.quantity;

//         if (
//           existingItem.remainingQuantity !== null &&
//           nextQty > existingItem.remainingQuantity
//         ) {
//           existingItem.quantity = existingItem.remainingQuantity;
//         } else {
//           existingItem.quantity = nextQty;
//         }

//         recalculateItem(existingItem);
//       } else {
//         state.push(newItem);
//       }
//     },

//     updateCartItemQuantity: (state, action) => {
//       const { id, quantity } = action.payload;
//       const item = state.find((cartItem) => cartItem.id === id);

//       if (!item) return;

//       const finalQuantity = Number(quantity);

//       if (!finalQuantity || finalQuantity <= 0) {
//         return state.filter((cartItem) => cartItem.id !== id);
//       }

//       if (
//         item.remainingQuantity !== null &&
//         finalQuantity > item.remainingQuantity
//       ) {
//         item.quantity = item.remainingQuantity;
//       } else {
//         item.quantity = finalQuantity;
//       }

//       recalculateItem(item);
//     },

//     incrementCartItem: (state, action) => {
//       const item = state.find((cartItem) => cartItem.id === action.payload);

//       if (!item) return;

//       const nextQty = Number(item.quantity || 1) + 1;

//       if (item.remainingQuantity !== null && nextQty > item.remainingQuantity) {
//         return;
//       }

//       item.quantity = nextQty;
//       recalculateItem(item);
//     },

//     decrementCartItem: (state, action) => {
//       const item = state.find((cartItem) => cartItem.id === action.payload);

//       if (!item) return;

//       if (Number(item.quantity || 1) <= 1) {
//         return state.filter((cartItem) => cartItem.id !== action.payload);
//       }

//       item.quantity -= 1;
//       recalculateItem(item);
//     },

//     updateCartItemNotes: (state, action) => {
//       const { id, notes } = action.payload;
//       const item = state.find((cartItem) => cartItem.id === id);

//       if (!item) return;

//       item.notes = ITEM_NOTE_OPTIONS.includes(notes || "") ? notes || "" : "";
//     },

//     removeItem: (state, action) => {
//       return state.filter((item) => item.id !== action.payload);
//     },

//     removeAllItems: () => {
//       return [];
//     },
//   },
// });

// export const getTotalOriginalPrice = (state) =>
//   state.cart.reduce(
//     (total, item) =>
//       total + Number(item.originalPrice || 0) * Number(item.quantity || 1),
//     0,
//   );

// export const getCategoryDiscountTotal = (state) =>
//   state.cart.reduce(
//     (total, item) =>
//       total +
//       Number(item.categoryDiscountAmount || 0) * Number(item.quantity || 1),
//     0,
//   );

// export const getTotalPrice = (state) =>
//   state.cart.reduce(
//     (total, item) =>
//       total + Number(item.finalItemPrice || 0) * Number(item.quantity || 1),
//     0,
//   );

// export const getTotalItems = (state) =>
//   state.cart.reduce((total, item) => total + Number(item.quantity || 1), 0);

// export const {
//   addItems,
//   updateCartItemQuantity,
//   incrementCartItem,
//   decrementCartItem,
//   updateCartItemNotes,
//   removeItem,
//   removeAllItems,
// } = cartSlice.actions;

// export default cartSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

export const ITEM_NOTE_OPTIONS = [
  "",
  "Less Spicy",
  "No Onion",
  "Extra Cheese",
  "No Sugar",
  "Extra Sauce",
];

const initialState = [];

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const roundMoney = (value) => Number(toNumber(value).toFixed(2));

const getCategory = (item = {}) => {
  if (typeof item.category === "object" && item.category !== null) {
    return item.category;
  }

  return item.categoryData || null;
};

const getSafeNote = (notes = "") => {
  return ITEM_NOTE_OPTIONS.includes(notes || "") ? notes || "" : "";
};

const getRemainingQuantity = (item = {}) => {
  const prepared = toNumber(item.dailyPreparedQuantity, 0);
  const sold = toNumber(item.dailySoldQuantity, 0);

  if (prepared <= 0) return null;

  return Math.max(prepared - sold, 0);
};

const isSoldOut = (item = {}) => {
  const remaining = getRemainingQuantity(item);
  return remaining !== null && remaining <= 0;
};

const recalculateItem = (item) => {
  const originalPrice = toNumber(item.originalPrice, 0);
  const quantity = Math.max(toNumber(item.quantity, 1), 1);
  const discountPercent = Math.min(
    Math.max(toNumber(item.categoryDiscountPercent, 0), 0),
    100,
  );

  const categoryDiscountAmount = roundMoney(
    (originalPrice * discountPercent) / 100,
  );

  const finalItemPrice = roundMoney(
    Math.max(originalPrice - categoryDiscountAmount, 0),
  );

  item.quantity = quantity;
  item.categoryDiscountPercent = discountPercent;
  item.categoryDiscountAmount = categoryDiscountAmount;
  item.finalItemPrice = finalItemPrice;
  item.finalTotal = roundMoney(finalItemPrice * quantity);
  item.total = item.finalTotal;
};

const normalizeCartItem = (item = {}) => {
  const category = getCategory(item);

  const quantity = Math.max(toNumber(item.quantity, 1), 1);
  const originalPrice = roundMoney(
    item.originalPrice ?? item.price ?? item.pricePerQuantity ?? 0,
  );

  const categoryDiscountPercent = Math.min(
    Math.max(
      toNumber(
        item.categoryDiscountPercent ??
          category?.discountPercent ??
          item.discountPercent ??
          0,
        0,
      ),
      0,
    ),
    100,
  );

  const remainingQuantity = getRemainingQuantity(item);
  const notes = getSafeNote(item.notes);

  const normalizedItem = {
    id: String(item.id || `${item._id || item.dishId}-${Date.now()}`),

    dishId: item.dishId || item._id || null,
    name: item.name || "Unnamed Item",
    image: item.image || "",

    categoryId: category?._id || item.categoryId || null,
    categoryName: category?.name || item.categoryName || "",

    quantity,

    originalPrice,
    price: originalPrice,
    pricePerQuantity: originalPrice,

    categoryDiscountPercent,
    categoryDiscountAmount: 0,

    finalItemPrice: originalPrice,
    finalTotal: 0,
    total: 0,

    notes,

    estimatedPreparationMinutes:
      Math.max(toNumber(item.estimatedPreparationMinutes, 10), 1) || 10,

    dailyPreparedQuantity: toNumber(item.dailyPreparedQuantity, 0),
    dailySoldQuantity: toNumber(item.dailySoldQuantity, 0),
    remainingQuantity,

    isAvailable: item.isAvailable !== false,
    isSoldOut: isSoldOut(item),
  };

  recalculateItem(normalizedItem);

  return normalizedItem;
};

const canAddQuantity = (item, nextQty) => {
  if (item.remainingQuantity === null) return true;
  return nextQty <= item.remainingQuantity;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addItems: (state, action) => {
      const newItem = normalizeCartItem(action.payload);

      if (!newItem.dishId || !newItem.isAvailable || newItem.isSoldOut) {
        return;
      }

      const existingItem = state.find(
        (item) =>
          String(item.dishId) === String(newItem.dishId) &&
          getSafeNote(item.notes) === getSafeNote(newItem.notes),
      );

      if (existingItem) {
        const nextQty = toNumber(existingItem.quantity, 1) + newItem.quantity;

        existingItem.quantity = canAddQuantity(existingItem, nextQty)
          ? nextQty
          : existingItem.remainingQuantity;

        recalculateItem(existingItem);
        return;
      }

      if (
        newItem.remainingQuantity !== null &&
        newItem.quantity > newItem.remainingQuantity
      ) {
        newItem.quantity = newItem.remainingQuantity;
        recalculateItem(newItem);
      }

      state.push(newItem);
    },

    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload || {};
      const item = state.find((cartItem) => cartItem.id === id);

      if (!item) return;

      const finalQuantity = toNumber(quantity, 0);

      if (finalQuantity <= 0) {
        return state.filter((cartItem) => cartItem.id !== id);
      }

      item.quantity = canAddQuantity(item, finalQuantity)
        ? finalQuantity
        : item.remainingQuantity;

      recalculateItem(item);
    },

    incrementCartItem: (state, action) => {
      const item = state.find((cartItem) => cartItem.id === action.payload);

      if (!item) return;

      const nextQty = toNumber(item.quantity, 1) + 1;

      if (!canAddQuantity(item, nextQty)) return;

      item.quantity = nextQty;
      recalculateItem(item);
    },

    decrementCartItem: (state, action) => {
      const item = state.find((cartItem) => cartItem.id === action.payload);

      if (!item) return;

      if (toNumber(item.quantity, 1) <= 1) {
        return state.filter((cartItem) => cartItem.id !== action.payload);
      }

      item.quantity = toNumber(item.quantity, 1) - 1;
      recalculateItem(item);
    },

    updateCartItemNotes: (state, action) => {
      const { id, notes } = action.payload || {};
      const item = state.find((cartItem) => cartItem.id === id);

      if (!item) return;

      item.notes = getSafeNote(notes);
    },

    removeItem: (state, action) => {
      return state.filter((item) => item.id !== action.payload);
    },

    removeAllItems: () => {
      return [];
    },
  },
});

export const getTotalOriginalPrice = (state) =>
  state.cart.reduce(
    (total, item) =>
      total + toNumber(item.originalPrice, 0) * toNumber(item.quantity, 1),
    0,
  );

export const getCategoryDiscountTotal = (state) =>
  state.cart.reduce(
    (total, item) =>
      total +
      toNumber(item.categoryDiscountAmount, 0) * toNumber(item.quantity, 1),
    0,
  );

export const getTotalPrice = (state) =>
  state.cart.reduce((total, item) => total + toNumber(item.finalTotal, 0), 0);

export const getTotalItems = (state) =>
  state.cart.reduce((total, item) => total + toNumber(item.quantity, 1), 0);

export const {
  addItems,
  updateCartItemQuantity,
  incrementCartItem,
  decrementCartItem,
  updateCartItemNotes,
  removeItem,
  removeAllItems,
} = cartSlice.actions;

export default cartSlice.reducer;
