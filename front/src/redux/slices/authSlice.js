// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

// Реєстрація
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

// Логін
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

// Логаут
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
    token: initialToken, // беремо з localStorage або ""  
    isAuthenticated: !!initialToken,
    status: null,
    error: null,
  },
  reducers: {
    // додаткові ред’юсери, якщо треба
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // REGISTER
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

    // LOGIN
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

    // LOGOUT
    builder.addCase(logoutUser.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(logoutUser.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      if (action.payload.success) {
        // успішний логаут
        state.token = "";
        state.isAuthenticated = false;
        localStorage.removeItem("token");
      } else {
        // якщо success = false, теж очищуємо (оскільки токен вже не валідний)
        state.token = "";
        state.isAuthenticated = false;
        localStorage.removeItem("token");
      }
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      // навіть при помилці логауту можна очищати токен
      state.token = "";
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    });
  },
});

export const { resetError } = authSlice.actions;

export default authSlice.reducer;
