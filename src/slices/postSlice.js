import { createSlice, createSelector } from '@reduxjs/toolkit';
import { dislikeAPost, likeAPost, makeAPost } from './postThunks';
import axios from 'axios';

const initialPostState = {
  posts: [],
  status: 'idle',
  error: false,
  errorMessage: null,
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
    deletePost(state, action) {
      const postId = action.payload;
      state.posts = state.posts.filter(post => post._id !== postId);
    },
    acknowledgeError(state) {
      state.error = false;
      state.errorMessage = '';
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
      state.error = !!state.errorMessage;
    },
    [likeAPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { post, user } = action.payload;
      const foundPost = state.posts.find(p => p._id === post._id);
      const foundUser = post.likes.find(u => u._id === user);
      foundPost.likes.push(foundUser);
      return state;
    },
    [likeAPost.pending]: state => {
      state.status = 'pending';
    },
    [likeAPost.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
      state.error = !!state.errorMessage;
    },
    [dislikeAPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { post, user } = action.payload;
      const foundPost = state.posts.find(p => p._id === post._id);
      foundPost.likes = foundPost.likes.filter(person => person._id !== user);
      return state;
    },
    [dislikeAPost.pending]: state => {
      state.status = 'pending';
    },
    [dislikeAPost.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
      state.error = !!state.errorMessage;
    },
  },
});

export const postError = state => state.post.error;
export const postErrorMessage = state => state.post.errorMessage;
export const postStatus = state => state.post.status;
export const selectAllPosts = state => state.post.posts;
export const selectPostById = (state, postId) =>
  state.post.posts.find(post => post._id === postId);

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter(post => post.userId === userId)
);

export const deleteAPost = postId => {
  return async (dispatch, getState) => {
    const postToDelete = async () => {
      const state = getState();
      const res = await axios({
        method: 'DELETE',
        url: `http://localhost:8000/api/posts/${postId}`,
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
        },
      });
      if (res.data.status === 'fail' || res.data.status === 'error') {
        throw new Error(res.data.message);
      }
    };
    try {
      await postToDelete();
      dispatch(postActions.deletePost(postId));
    } catch (err) {
      throw new Error(err.response.data.message);
    }
  };
};

export const postActions = postSlice.actions;

export default postSlice;
