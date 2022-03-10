import React, { useEffect, useState } from 'react';
import LeftBar from '../components/LeftBar';
import RightBar from '../components/RightBar';
import UserFeed from '../components/UserFeed';
import './FriendProfile.css';
import { useParams } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useHttp } from '../hooks/useHttp';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { userToken } from '../slices/authSlice';

const FriendProfile = () => {
  const { userId } = useParams();
  const token = useSelector(userToken);
  const [posts, setPosts] = useState([]);
  const [friendProfile, setFriendProfile] = useState([]);
  const { loading, error, sendRequest, clearError } = useHttp();

  useEffect(() => {
    const fetchFriendsData = async () => {
      const res = await sendRequest(
        `http://localhost:8000/api/users/${userId}/friends`,
        'GET',
        {
          Authorization: `Bearer ${token}`,
        }
      );
      res.user.posts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(res.user.posts);
      setFriendProfile(res.user);
    };
    fetchFriendsData();
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
        <LeftBar user={friendProfile} />
        <div className="profile__right">
          <div className="profile__top">
            <div className="profile__cover-pic">
              <img
                className="profile__cover-image"
                src={`${friendProfile?.coverPic}`}
                alt={`${friendProfile.firstName} profile`}
              />
              <img
                className="profile__user-image"
                src={`http://localhost:8000/${friendProfile.profilePic}`}
                alt=""
              />
            </div>
            <div className="profile__info">
              <h4 className="profile__info--name">{`${friendProfile.firstName} ${friendProfile.lastName}`}</h4>
              <span className="profile__info--desc">My catch phrase</span>
            </div>
          </div>
          <div className="profile__right--bottom">
            <UserFeed user={friendProfile} posts={posts} />
            <RightBar user={friendProfile} />
          </div>
        </div>
        <Outlet />
      </div>
    </React.Fragment>
  );
};

export default FriendProfile;
