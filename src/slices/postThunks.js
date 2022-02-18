import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const makeAPost = createAsyncThunk(
  'post/makeAPost',
  async ({ token, formData }, thunkAPI) => {
    try {
      const res = await axios({
        method: 'POST',
        url: 'http://localhost:8000/api/posts',
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
