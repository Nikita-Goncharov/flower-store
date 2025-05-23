import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching orders");
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async ({ flowerName, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post("/orders", {
        flower_name: flowerName,
        quantity,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error creating order");
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    list: [],
    status: null,
    error: null,
    createOrderStatus: null,
    createOrderError: null,
  },
  reducers: {
    resetCreateOrderStatus(state) {
      state.createOrderStatus = null;
      state.createOrderError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      if (action.payload.success) {
        state.list = action.payload.data;
      } else {
        state.error = action.payload.message;
        state.list = [];
      }
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.list = [];
    });

    builder.addCase(createOrder.pending, (state) => {
      state.createOrderStatus = "loading";
      state.createOrderError = null;
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.createOrderStatus = "succeeded";
      state.createOrderError = null;
      if (!action.payload.success) {
        state.createOrderStatus = "failed";
        state.createOrderError = action.payload.message;
      }
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.createOrderStatus = "failed";
      state.createOrderError = action.payload;
    });
  },
});

export const { resetCreateOrderStatus } = ordersSlice.actions;

export default ordersSlice.reducer;
