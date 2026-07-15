//final kds
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderId: "",
  customerName: "",
  customerPhone: "",
  systemNotes: "",
  guests: 1,
  orderType: "walkin",
  table: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomer: (state, action) => {
      const {
        name = "",
        phone = "",
        systemNotes = "",
        notes = "",
        guests = 1,
        orderType = "walkin",
      } = action.payload;

      state.orderId = `${Date.now()}`;
      state.customerName = name.trim();
      state.customerPhone = phone.trim();
      state.systemNotes = systemNotes || notes || "";
      state.guests = Number(guests || 1);
      state.orderType = orderType;
      state.table = null;
    },

    updateCustomer: (state, action) => {
      const { name, phone, systemNotes, notes, guests, orderType } =
        action.payload;

      if (name !== undefined) state.customerName = name.trim();
      if (phone !== undefined) state.customerPhone = phone.trim();

      if (systemNotes !== undefined) state.systemNotes = systemNotes;
      if (notes !== undefined) state.systemNotes = notes;

      if (guests !== undefined) state.guests = Number(guests || 1);
      if (orderType !== undefined) state.orderType = orderType;
    },

    updateTable: (state, action) => {
      state.table = action.payload.table;
    },

    removeCustomer: () => {
      return initialState;
    },
  },
});

export const { setCustomer, updateCustomer, updateTable, removeCustomer } =
  customerSlice.actions;

export default customerSlice.reducer;
