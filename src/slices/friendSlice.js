import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import axios from 'axios';

export const commentOnAFriendsPost = createAsyncThunk(
  'friend/commentOnAFriendsPost',
  async ({ token, postId, comment }, thunkAPI) => {
    try {
      const controller = new AbortController();
      const res = await axios({
        method: 'POST',
        url: `http://localhost:8000/api/posts/${postId}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          comment,
        },
      });
      thunkAPI.signal.addEventListener('abort', () => {
        controller.abort();
        return thunkAPI.rejectWithValue('Request Aborted!');
      });
      const data = await res.data;
      if (res.data.status === 'error' || res.data.status === 'fail') {
        throw new Error(res.data.message);
      }
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const likeAFriendsPost = createAsyncThunk(
  'friend/likeAFriendsPost',
  async ({ token, postId }, thunkAPI) => {
    try {
      const controller = new AbortController();
      const res = await axios({
        method: 'PUT',
        url: `http://localhost:8000/api/posts/${postId}/like`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      thunkAPI.signal.addEventListener('abort', () => {
        controller.abort();
        return thunkAPI.rejectWithValue('Request Aborted!');
      });
      const data = await res.data;
      if (res.data.status === 'error' || res.data.status === 'fail') {
        throw new Error(res.data.message);
      }
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const dislikeAFriendsPost = createAsyncThunk(
  'friend/dislikeAFriendsPost',
  async ({ token, postId }, thunkAPI) => {
    try {
      const controller = new AbortController();
      const res = await axios({
        method: 'PUT',
        url: `http://localhost:8000/api/posts/${postId}/dislike`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      thunkAPI.signal.addEventListener('abort', () => {
        controller.abort();
        return thunkAPI.rejectWithValue('Request Aborted!');
      });
      const data = await res.data;
      if (res.data.status === 'error' || res.data.status === 'fail') {
        throw new Error(res.data.message);
      }
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

const initialFriendState = {
  friendProfile: null,
  friendPosts: [],
  error: null,
  errorMessage: null,
};

const friendSlice = createSlice({
  name: 'friend',
  initialState: initialFriendState,
  reducers: {
    setFriendsProfileData(state, action) {
      state.status = 'success';
      const { user, posts } = action.payload;
      state.friendPosts = posts;
      state.friendProfile = user;
    },
    clearFriendsProfileData(state, action) {
      return initialFriendState;
    },
  },
  extraReducers: {
    [commentOnAFriendsPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { comment } = action.payload;
      const postId = comment.post;
      const foundPost = state.friendPosts.find(post => post._id === postId);
      foundPost.comments.push(comment);
    },
    [commentOnAFriendsPost.pending]: state => {
      state.status = 'pending';
    },
    [commentOnAFriendsPost.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
      state.error = !!state.errorMessage;
    },
    [likeAFriendsPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { post, user } = action.payload;
      const foundPost = state.friendPosts.find(p => p._id === post._id);
      const foundUser = post.likes.find(u => u._id === user);
      foundPost.likes.push(foundUser);
      return state;
    },
    [likeAFriendsPost.pending]: state => {
      state.status = 'pending';
    },
    [likeAFriendsPost.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
      state.error = !!state.errorMessage;
    },
    [dislikeAFriendsPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { post, user } = action.payload;
      const foundPost = state.friendPosts.find(p => p._id === post._id);
      foundPost.likes = foundPost.likes.filter(person => person._id !== user);
      return state;
    },
    [dislikeAFriendsPost.pending]: state => {
      state.status = 'pending';
    },
    [dislikeAFriendsPost.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
      state.error = !!state.errorMessage;
    },
  },
});

export const friend = state => state.friend.friendProfile;
export const friendsPosts = state => state.friend.friendPosts;
export const selectFriendPostId = (state, postId) => postId;
export const selectFriendPostComments = createSelector(
  [friendsPosts, selectFriendPostId, (state, posts, postId) => postId],
  (posts, postId) =>
    posts.flatMap(p => p.comments.filter(comment => comment.post === postId))
);

export const friendAction = friendSlice.actions;
export default friendSlice;
