import { createSlice, createSelector } from '@reduxjs/toolkit';
import { likeAPost, makeAPost } from './postThunks';

const initialPostState = {
  posts: [],
  status: 'idle',
  errorMessage: '',
  timelineFeed: [],
};

const postSlice = createSlice({
  name: 'post',
  initialState: initialPostState,
  reducers: {
    setPosts(state, action) {
      state.posts.push(...action.payload.posts);
      state.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    clearPosts() {
      return initialPostState;
    },
  },
  extraReducers: {
    [makeAPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { post } = action.payload;
      state.posts.push(post);
      state.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return state;
    },
    [makeAPost.pending]: state => {
      state.status = 'pending';
    },
    [makeAPost.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
    },
    [likeAPost.fulfilled]: (state, action) => {
      state.status = 'success';
    },
  },
});

export const selectAllPosts = state => state.post.posts;
export const selectPostById = (state, postId) =>
  state.post.posts.find(post => post._id === postId);

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter(post => post.userId === userId)
);

export const postActions = postSlice.actions;

export default postSlice;
