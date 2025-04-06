// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import flowersReducer from "./slices/flowersSlice";
import ordersReducer from "./slices/ordersSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    flowers: flowersReducer,
    orders: ordersReducer,
  },
});

export default store;
