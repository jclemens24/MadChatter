import { createSlice, createSelector } from '@reduxjs/toolkit';
import {
  addAFriend,
  initializeUser,
  login,
  register,
  unfollowAFriend,
} from './authThunks';

const initialAuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
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
    deleteAPhoto(state, action) {
      state.user.photos = state.user.photos.filter(
        pic => pic !== action.payload
      );
    },
    acknowledgeError(state) {
      state.status = 'idle';
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
    },
    [initializeUser.pending]: state => {
      state.status = 'pending';
    },
    [initializeUser.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
      state.isLoggedIn = false;
      state.token = null;
    },
    [addAFriend.fulfilled]: (state, action) => {
      state.status = 'success';
      state.user.following.push(action.payload.user);
    },
    [addAFriend.pending]: (state, action) => {
      state.status = 'pending';
    },
    [addAFriend.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
    },
    [unfollowAFriend.fulfilled]: (state, action) => {
      state.status = 'success';
      state.user.following = state.user.following.filter(
        friend => friend._id !== action.payload.user._id
      );
    },
    [unfollowAFriend.pending]: state => {
      state.status = 'pending';
    },
    [unfollowAFriend.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
    },
  },
});

export const userToken = state => state.auth.token;

export const authorizedUser = state => state.auth.user;

export const selectAllFriends = state => state.auth.user.following;

export const selectFriendById = createSelector(
  [selectAllFriends, (state, userId) => userId],
  (friends, userId) => friends.find(friend => friend._id === userId)
);

export const authStatus = state => state.auth.status;
export const authError = state => state.auth.errorMessage;

export const authAction = authSlice.actions;

export default authSlice;
