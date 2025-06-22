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

export const changeOrderQuantity = createAsyncThunk(
  "orders/changeOrderQuantity",
  async ({ orderId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}`, {
        quantity,
      });
      return { orderId, quantity };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error updating quantity");
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      await api.delete(`/orders/${orderId}`);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error deleting order");
    }
  }
);


export const updateOrdersStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ orderIds, status }, { rejectWithValue }) => {
    try {
      const responses = await Promise.all(
        orderIds.map((id) =>
          api.put(`/orders/${id}`, { status })
        )
      );
      return status
    } catch (err) {
      return rejectWithValue(err.response?.data || "Unknown error");
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
    builder.addCase(changeOrderQuantity.fulfilled, (state, action) => {
      const { orderId, quantity } = action.payload;
      const order = state.list.find(o => o.id === orderId);
      if (order) {
        order.amount = order.flower.price * quantity
        order.quantity = quantity;
      }
    });
    builder.addCase(deleteOrder.fulfilled, (state, action) => {
      const orderId = action.payload;
      state.list = state.list.filter(order => order.id !== orderId);
    });
    builder.addCase(updateOrdersStatus.pending, (state) => {
      state.status = "loading";
      state.error = null;
    })
    builder.addCase(updateOrdersStatus.fulfilled, (state) => {
      state.status = "succeeded";
    })
    builder.addCase(updateOrdersStatus.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });
  },
});

export const { resetCreateOrderStatus } = ordersSlice.actions;

export default ordersSlice.reducer;
