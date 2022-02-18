import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../slices/authSlice';
import postSlice from '../slices/postSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    post: postSlice.reducer,
  },
});
