import axios from 'axios';
import { authAction } from './authSlice';
import { postActions } from './postSlice';

export const logout = () => {
  return async dispatch => {
    localStorage.removeItem('user');
    dispatch(authAction.logout());
    dispatch(postActions.clearPosts());
    return;
  };
};

// export const addAFriend = id => {
//   return async (dispatch, getState) => {
//     const addFriend = async () => {
//       const state = getState();
//       const res = await axios({
//         url: `http://localhost:8000/api/users/${state.user._id}/friends?unfollow=0`,
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${state.token}`,
//         },
//         data: {
//           id: id,
//         },
//       });
//       if (res.data.status === 'fail' || res.data.status === 'error') {
//         throw new Error(res.data.message);
//       }
//       const data = await res.data;
//       return data;
//     };
//     try {
//       const friendData = await addFriend();
//     } catch (err) {}
//   };
// };
