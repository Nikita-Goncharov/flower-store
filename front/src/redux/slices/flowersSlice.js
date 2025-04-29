import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchFlowers = createAsyncThunk(
  "flowers/fetchFlowers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/flowers");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching flowers");
    }
  }
);

const flowersSlice = createSlice({
  name: "flowers",
  initialState: {
    items: [],
    status: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFlowers.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(fetchFlowers.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      if (action.payload.success) {
        state.items = action.payload.data;
      } else {
        state.error = action.payload.message;
        state.items = [];
      }
    });
    builder.addCase(fetchFlowers.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.items = [];
    });
  },
});

export default flowersSlice.reducer;
