import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/register", {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Register error");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", {
        email,
        password,
      });
      return response.data; // { success, token, message }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login error");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/logout");
    return response.data; // { success, message }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Logout error");
  }
});

const initialToken = localStorage.getItem("token") || "";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: initialToken,
    isAuthenticated: !!initialToken,
    status: null,
    error: null,
  },
  reducers: {
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.status = "succeeded";
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    builder.addCase(loginUser.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      if (action.payload.success) {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
      } else {
        state.error = action.payload.message;
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    builder.addCase(logoutUser.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(logoutUser.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      if (action.payload.success) {
        state.token = "";
        state.isAuthenticated = false;
        localStorage.removeItem("token");
      } else {
        state.token = "";
        state.isAuthenticated = false;
        localStorage.removeItem("token");
      }
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.token = "";
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    });
  },
});

export const { resetError } = authSlice.actions;

export default authSlice.reducer;
