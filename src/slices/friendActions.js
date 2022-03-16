import axios from 'axios';
import { friendAction } from './friendSlice';

export const fetchFriendsProfileData = (userId, token) => {
  return async dispatch => {
    const fetchData = async () => {
      const res = await axios({
        url: `http://localhost:8000/api/users/${userId}/profile`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.data;
      if (res.data.status === 'fail' || res.data.status === 'error') {
        throw new Error(res.data.message);
      }
      return data;
    };
    try {
      const profileData = await fetchData();
      dispatch(
        friendAction.setFriendsProfileData({
          posts: profileData.posts,
          user: profileData.user,
        })
      );
    } catch (err) {
      throw new Error(err.response.data.message);
    }
  };
};
