import { createSlice } from "@reduxjs/toolkit";
const initialState = { workflow: "KITCHEN", restaurantName: "Restaurant POS", isLoaded: false };
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setRestaurantSettings: (state, action) => {
      state.workflow = action.payload?.workflow === "POST_BILLING" ? "POST_BILLING" : "KITCHEN";
      state.restaurantName = action.payload?.restaurantName || "Restaurant POS";
      state.isLoaded = true;
    },
    setWorkflow: (state, action) => { state.workflow = action.payload === "POST_BILLING" ? "POST_BILLING" : "KITCHEN"; state.isLoaded = true; },
    resetRestaurantSettings: () => initialState,
  },
});
export const { setRestaurantSettings, setWorkflow, resetRestaurantSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
