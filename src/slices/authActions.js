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
