import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  status: null,
  usersdata: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },

    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.usersdata = {}; // ✅ Clear cache
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      console.log("🧹 User logged out and cache cleared");
    },

    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    setAttendanceStatus: (state, action) => {
      state.status = action.payload;
    },

    cacheUser: (state, action) => {
      const { id, userData } = action.payload;
      state.usersdata[id] = userData;
    },

    clearUserCache: (state) => {
      state.usersdata = {};
    },
  },
});

export const {
  loginUser,
  logoutUser,
  setUser,
  setAttendanceStatus,
  cacheUser,
  clearUserCache,
} = authSlice.actions;

export default authSlice.reducer;
