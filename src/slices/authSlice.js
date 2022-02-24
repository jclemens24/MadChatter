import { createSlice, createSelector } from '@reduxjs/toolkit';
import { initializeUser, login, register } from './authThunks';

const initialAuthState = {
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    unfollow(state, action) {
      const { id } = action.payload;
      const friendToUnfollow = state.user.following.find(
        friend => friend._id === id
      );
      if (friendToUnfollow) {
        state.user.following = state.user.following.filter(
          friend => friend._id !== id
        );
      }
    },
    follow(state, action) {
      state.user.following.push(action.payload);
    },
    updateState(state, action) {
      state.user = action.payload.user;
    },
    setProfilePic(state, action) {
      const { photo } = action.payload;
      state.user.profilePic = photo;
    },
    updatePhotos(state, action) {
      state.user.photos.push(action.payload);
    },
    logout() {
      return initialAuthState;
    },
  },
  extraReducers: {
    [login.fulfilled]: (state, action) => {
      state.status = 'success';
      state.token = action.payload.token;
      state.user = action.payload.user;
      delete state.user.posts;
      state.isLoggedIn = !!state.token;
      return state;
    },
    [login.pending]: state => {
      state.status = 'pending';
    },
    [login.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
    },

    [register.fulfilled]: (state, action) => {
      state.status = 'success';
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      delete state.user.posts;
      state.isLoggedIn = true;
      return state;
    },
    [register.pending]: state => {
      state.status = 'pending';
    },
    [register.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
    },
    [initializeUser.fulfilled]: (state, action) => {
      state.user = action.payload.data.user;
      delete state.user.posts;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.status = 'success';
      return state;
    },
    [initializeUser.pending]: state => {
      state.status = 'pending';
    },
    [initializeUser.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
    },
  },
});

export const authAction = authSlice.actions;

export const selectAllFriends = state => state.auth.user.following;

export const selectFriendById = createSelector(
  [selectAllFriends, (state, userId) => userId],
  (following, userId) => following.find(friend => friend._id === userId)
);

export default authSlice;
