import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import axios from 'axios';

export const getFriendsProfileData = createAsyncThunk(
  'friend/getFriendsProfileData',
  async ({ token, userId }, thunkAPI) => {
    try {
      const controller = new AbortController();
      const res = await axios({
        method: 'GET',
        url: `${process.env.REACT_APP_BACKEND_URL}/users/${userId}/profile/friends`,
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

export const likeAFriendsPost = createAsyncThunk(
  'friend/likeAFriendsPost',
  async ({ token, postId }, thunkAPI) => {
    try {
      const controller = new AbortController();
      const res = await axios({
        method: 'PUT',
        url: `${process.env.REACT_APP_BACKEND_URL}/posts/${postId}/like`,
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
        url: `${process.env.REACT_APP_BACKEND_URL}/posts/${postId}/dislike`,
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

export const commentOnAFriendsPost = createAsyncThunk(
  'friend/commentOnAFriendsPost',
  async ({ token, postId, comment }, thunkAPI) => {
    try {
      const controller = new AbortController();
      const res = await axios({
        method: 'POST',
        url: `${process.env.REACT_APP_BACKEND_URL}/posts/${postId}/comments`,
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

export const makeAPostOnFriendsWall = createAsyncThunk(
  'friend/makeAPostOnFriendsWall',
  async ({ token, formData }, thunkAPI) => {
    try {
      const res = await axios({
        method: 'POST',
        url: `${process.env.REACT_APP_BACKEND_URL}/posts`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: formData,
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
  status: 'idle',
};

const friendSlice = createSlice({
  name: 'friend',
  initialState: initialFriendState,
  reducers: {
    clearFriendsProfileData() {
      return initialFriendState;
    },
    acknowledgeError(state) {
      state.error = null;
    },
    deleteAPost(state, action) {
      const foundPost = state.friendPosts.find(
        post => post._id === action.payload
      );
      if (foundPost) {
        state.friendPosts = state.friendPosts.filter(
          post => post._id !== foundPost._id
        );
      }
    },
    reactionAdded(state, action) {
      const { commentId, reaction } = action.payload;
      const comments = state.friendPosts.flatMap(post => post.comments);
      const foundComment = comments.find(comment => comment._id === commentId);
      if (foundComment) {
        foundComment.reactions[reaction]++;
      }
    },
  },
  extraReducers: {
    [getFriendsProfileData.fulfilled]: (state, action) => {
      state.status = 'success';
      const { posts, user } = action.payload;
      state.friendPosts = posts;
      state.friendProfile = user;
      state.friendPosts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    [getFriendsProfileData.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
      state.error = !!state.errorMessage;
    },
    [likeAFriendsPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { post, user } = action.payload;
      const foundPost = state.friendPosts.find(p => p._id === post._id);
      foundPost.likes.push(user);
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
      foundPost.likes = foundPost.likes.filter(person => person !== user);
    },
    [dislikeAFriendsPost.pending]: state => {
      state.status = 'pending';
    },
    [dislikeAFriendsPost.rejected]: (state, action) => {
      state.status = 'failed';
      state.errorMessage = action.payload;
      state.error = !!state.errorMessage;
    },
    [commentOnAFriendsPost.fulfilled]: (state, action) => {
      state.status = 'success';
      const { comment } = action.payload;
      const foundPost = state.friendPosts.find(
        post => post._id === comment.post
      );
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
    [makeAPostOnFriendsWall.fulfilled]: (state, action) => {
      state.status = 'success';
      const { post } = action.payload;
      state.friendPosts.push(post);
      state.friendPosts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  },
});

export const friendStatus = state => state.friend.status;
export const friendError = state => state.friend.error;
export const friendErrorMessage = state => state.friend.errorMessage;
export const friend = state => state.friend.friendProfile;
export const friendsPosts = state => state.friend.friendPosts;
export const selectFriendPostId = (state, postId) => postId;
export const selectCurrentFriendPost = createSelector(
  [friendsPosts, selectFriendPostId, (state, posts, postId) => postId],
  (posts, postId) => posts.find(post => post._id === postId)
);
export const selectFriendPostComments = createSelector(
  [friendsPosts, selectFriendPostId, (state, posts, postId) => postId],
  (posts, postId) =>
    posts.flatMap(p => p.comments.filter(comment => comment.post === postId))
);

export const friendAction = friendSlice.actions;
export default friendSlice;
