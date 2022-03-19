import React, { useEffect } from 'react';
import LeftBar from '../components/LeftBar';
import RightBar from '../components/RightBar';
import FriendUserFeed from '../components/FriendUserFeed';
import './Profile.css';
import { Outlet, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { friendAction, getFriendsProfileData } from '../slices/friendSlice';
import { userToken } from '../slices/authSlice';

const FriendProfile = props => {
  const status = useSelector(state => state.friend.status);
  const error = useSelector(state => state.friend.error);
  const errorMessage = useSelector(state => state.friend.errorMessage);
  const userId = useParams().userId;
  const token = useSelector(userToken);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFriendsProfileData({ token, userId }))
      .unwrap()
      .then(data => {
        console.log(data);
      });
    return () => {
      dispatch(friendAction.clearFriendsProfileData());
    };
  }, [userId, token, dispatch]);

  const clearError = () => {
    dispatch(friendAction.acknowledgeError());
  };

  const friendsData = useSelector(state => state.friend.friendProfile);

  while (status === 'idle') {
    return <LoadingSpinner asOverlay />;
  }
  if (error) {
    return <ErrorModal error={errorMessage} onClear={clearError} />;
  }

  return (
    <React.Fragment>
      <div className="profile">
        <LeftBar user={friendsData} />
        <div className="profile__right">
          <div className="profile__top">
            <div className="profile__cover-pic">
              <img
                className="profile__cover-image"
                src={`http://localhost:8000/${friendsData.coverPic}`}
                alt={`${friendsData.firstName} profile`}
              />
              <img
                className="profile__user-image"
                src={`http://localhost:8000/${friendsData.profilePic}`}
                alt=""
              />
            </div>
            <div className="profile__info">
              <h4 className="profile__info--name">{`${friendsData.firstName} ${friendsData.lastName}`}</h4>
              <span className="profile__info--desc">
                {friendsData.catchPhrase}
              </span>
            </div>
          </div>
          <div className="profile__right--bottom">
            <FriendUserFeed user={friendsData} />
            <RightBar user={friendsData} />
          </div>
        </div>
        <Outlet />
      </div>
    </React.Fragment>
  );
};

export default FriendProfile;
