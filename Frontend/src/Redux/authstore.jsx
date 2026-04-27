import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Redux/Slice";

const store = configureStore({
  reducer: {
    auth: authReducer, // Registering the auth reducer
  },
});

export default store;