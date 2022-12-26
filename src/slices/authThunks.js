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
        url: `${process.env.REACT_APP_BACKEND_URL}/users`,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.data;
      thunkAPI.dispatch(postActions.setPosts({ posts: data.posts }));
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
      const body = {
        email: email,
        password: password,
      };

      const request = await axios({
        method: 'post',
        data: body,
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        url: `${process.env.REACT_APP_BACKEND_URL}/users/login`,
      });

      const data = await request.data;
      localStorage.setItem(
        'user',
        JSON.stringify({
          token: data.token,
          userId: data.user._id,
        })
      );
      thunkAPI.dispatch(postActions.setPosts({ posts: data.posts }));
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.request.data.message);
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
        url: `${process.env.REACT_APP_BACKEND_URL}/users/signup`,
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
      thunkAPI.dispatch(postActions.setPosts({ posts: data.posts }));
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const addAFriend = createAsyncThunk(
  'auth/addAFriend',
  async ({ id, userId, token }, thunkAPI) => {
    try {
      const res = await axios({
        method: 'PATCH',
        url: `${process.env.REACT_APP_BACKEND_URL}/users/${userId}/friends?follow=1`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          id,
        },
      });
      const data = await res.data;
      if (res.data.status === 'fail' || res.data.status === 'error') {
        throw new Error(res.data.message);
      }
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const unfollowAFriend = createAsyncThunk(
  'auth/unfollowAFriend',
  async ({ id, userId, token }, thunkAPI) => {
    try {
      const res = await axios({
        method: 'PATCH',
        url: `${process.env.REACT_APP_BACKEND_URL}/users/${userId}/friends?unfollow=1`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          id,
        },
      });
      const data = await res.data;
      if (res.data.status === 'fail' || res.data.status === 'error') {
        throw new Error(res.data.message);
      }
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);
