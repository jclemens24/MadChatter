import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { postActions } from './postSlice';

export const initializeUser = createAsyncThunk(
  'auth/initializeUser',
  async ({ token }, thunkAPI) => {
    try {
      const controller = new AbortController();
      const res = await axios({
        method: 'GET',
        url: 'http://localhost:8000/api/users',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.data;
      thunkAPI.dispatch(postActions.setPosts({ posts: data.user.posts }));
      return { data, token };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const controller = new AbortController();
      const res = await axios({
        method: 'POST',
        signal: controller.signal,
        url: 'http://localhost:8000/api/users/login',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email,
          password,
        },
      });
      thunkAPI.signal.addEventListener('abort', () => {
        controller.abort();
      });
      const data = await res.data;
      if (res.data.status === 'error' || res.data.status === 'fail') {
        throw new Error(res.data.message);
      }
      localStorage.setItem(
        'user',
        JSON.stringify({
          token: data.token,
          userId: data.user._id,
        })
      );
      thunkAPI.dispatch(postActions.setPosts({ posts: data.user.posts }));
      return data;
    } catch (err) {
      if (err === 'AbortError') thunkAPI.rejectWithValue('Request Aborted');
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (values, thunkAPI) => {
    try {
      const controller = new AbortController();
      const res = await axios({
        method: 'POST',
        signal: controller.signal,
        url: 'http://localhost:8000/api/users/signup',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          passwordConfirm: values.passwordConfirm,
          city: values.city,
          state: values.state,
          zip: values.zip,
          birthYear: values.birthYear,
        },
      });
      const data = await res.data;
      if (res.data.status === 'fail' || res.data.status === 'error') {
        throw new Error(res.data.message);
      }
      localStorage.setItem(
        'user',
        JSON.stringify({
          token: data.token,
          userId: data.user._id,
        })
      );
      return data;
    } catch (err) {
      thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);
