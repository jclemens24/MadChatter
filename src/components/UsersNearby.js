import './UsersNearby.css';
import React from 'react';
import { AddCircle } from '@mui/icons-material';
import { addAFriend } from '../slices/authThunks';
import { useDispatch, useSelector } from 'react-redux';
import { userToken, authorizedUser } from '../slices/authSlice';

const UsersNearby = props => {
  const token = useSelector(userToken);
  const authUser = useSelector(authorizedUser);
  const dispatch = useDispatch();
  const handleAddFriend = async id => {
    dispatch(addAFriend({ id, userId: authUser._id, token }));
  };

  return (
    <li className="friendsNearbyList">
      <img
        className="friendsNearbyImg"
        src={`${process.env.REACT_APP_ASSETS}/${props.user.profilePic}`}
        alt=""
      />
      <h4>
        {props.user.firstName} {props.user.lastName}
      </h4>
      <AddCircle
        className="add_icon"
        onClick={handleAddFriend.bind(null, props.user._id)}
      />
    </li>
  );
};

export default UsersNearby;
