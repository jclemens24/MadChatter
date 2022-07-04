import { createSlice, createSelector } from '@reduxjs/toolkit';
import {
  dislikeAPost,
  likeAPost,
  makeAPost,
  commentOnAPost,
  getTimelineFeedPosts,
} from './postThunks';
import { friendAction } from './friendSlice';
import axios from 'axios';

const initialPostState = {
  posts: [],
  status: 'idle',
  error: null,
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
    reactionAdded(state, action) {
      const { commentId, reaction } = action.payload;
      const comments = state.posts.flatMap(post => post.comments);
      const foundComment = comments.find(comment => comment._id === commentId);
      if (foundComment) {
        foundComment.reactions[reaction]++;
      }
    },
  },
  extraReducers: {
    [makeAPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { post } = action.payload;
      post.comments = [];
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
      foundPost.likes.push(user);
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
      foundPost.likes = foundPost.likes.filter(person => person !== user);
    },
    [dislikeAPost.pending]: state => {
      state.status = 'pending';
    },
    [dislikeAPost.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
      state.error = !!state.errorMessage;
    },
    [commentOnAPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { comment } = action.payload;
      const postId = comment.post;
      const foundPost = state.posts.find(post => post._id === postId);
      foundPost.comments.push(comment);
    },
    [commentOnAPost.pending]: state => {
      state.status = 'pending';
    },
    [commentOnAPost.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
      state.error = !!state.errorMessage;
    },
    [getTimelineFeedPosts.fulfilled]: (state, action) => {
      state.status = 'success';
      state.timelineFeed.push(...action.payload);
      state.timelineFeed = state.timelineFeed.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
    [getTimelineFeedPosts.pending]: state => {
      state.status = 'pending';
    },
    [getTimelineFeedPosts.rejected]: (state, action) => {
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
export const selectPostId = (state, postId) => postId;
export const selectPostComments = createSelector(
  [selectAllPosts, selectPostId, (state, posts, postId) => postId],
  (posts, postId) =>
    posts.flatMap(post =>
      post.comments.filter(comment => comment.post === postId)
    )
);

export const selectAllTimelinePosts = state => state.post.timelineFeed;

export const deleteAPost = postId => {
  return async (dispatch, getState) => {
    const postToDelete = async () => {
      const state = getState();
      const res = await axios({
        method: 'DELETE',
        url: `${process.env.REACT_APP_BACKEND_URL}/posts/${postId}`,
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
      dispatch(friendAction.deleteAPost(postId));
    } catch (err) {
      throw new Error(err.response.data.message);
    }
  };
};

export const postActions = postSlice.actions;

export default postSlice;
