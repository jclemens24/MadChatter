import { createSlice, createSelector } from '@reduxjs/toolkit';
import { makeAPost } from './postThunks';

const initialPostState = {
  posts: [],
  status: 'idle',
  errorMessage: '',
};

const postSlice = createSlice({
  name: 'post',
  initialState: initialPostState,
  reducers: {
    setPosts(state, action) {
      state.posts.push(...action.payload.posts);
    },
  },
  extraReducers: {
    [makeAPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { post } = action.payload;
      state.posts.push(post);
      return state;
    },
    [makeAPost.pending]: (state, action) => {
      state.status = 'pending';
    },
    [makeAPost.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
    },
  },
});

export const postActions = postSlice.actions;

export default postSlice;
