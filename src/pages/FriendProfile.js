import React, { useEffect, useState } from 'react';
import LeftBar from '../components/LeftBar';
import RightBar from '../components/RightBar';
import UserFeed from '../components/UserFeed';
import './FriendProfile.css';
import { useParams, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useHttp } from '../hooks/useHttp';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { userToken } from '../slices/authSlice';
import { friendAction } from '../slices/friendSlice';

const FriendProfile = () => {
  const { userId } = useParams();
  const [friendsData, setFriendsData] = useState({});
  const [posts, setPosts] = useState([]);
  const token = useSelector(userToken);
  const { loading, error, sendRequest, clearError } = useHttp();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFriendsData = async () => {
      const res = await sendRequest(
        `http://localhost:8000/api/users/${userId}/profile/friends`,
        'GET',
        {
          Authorization: `Bearer ${token}`,
        }
      );
      setFriendsData(res.user);
      setPosts(res.posts);
      dispatch(friendAction.setFriendsProfileData(res));
    };
    fetchFriendsData();
    return () => {
      dispatch(friendAction.clearFriendsProfileData());
    };
  }, [userId, token, sendRequest]);

  if (loading) {
    return <LoadingSpinner asOverlay />;
  }
  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
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
                src={`${friendsData.coverPic}`}
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
            <UserFeed user={friendsData} posts={posts} />
            <RightBar user={friendsData} />
          </div>
        </div>
        <Outlet />
      </div>
    </React.Fragment>
  );
};

export default FriendProfile;
