import React, { useEffect, useState } from 'react';
import './LeftBar.css';
import { Link } from 'react-router-dom';
import { RssFeedOutlined } from '@mui/icons-material';
import { ChatBubbleOutlineOutlined } from '@mui/icons-material';
import { PlayCircleOutlineOutlined } from '@mui/icons-material';
import {
  Group,
  Bookmarks,
  Help,
  Event,
  School,
  Settings,
  PhotoCameraOutlined,
} from '@mui/icons-material';
import { useHttp } from '../hooks/useHttp';
import { useSelector } from 'react-redux';
import UsersNearby from './UsersNearby';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { userToken } from '../slices/authSlice';

const LeftBar = props => {
  const token = useSelector(userToken);
  const authUser = useSelector(state => state.auth.user);
  const [nearbyFriends, setNearbyFriends] = useState([]);
  const { loading, error, sendRequest, clearError } = useHttp();
  useEffect(() => {
    const getNearbyFriends = async () => {
      try {
        const res = await sendRequest(
          `http://localhost:8000/api/users/${authUser.location.coordinates[0]},${authUser.location.coordinates[1]}`,
          'GET',
          { Authorization: `Bearer ${token}` }
        );

        setNearbyFriends(res.users.filter(user => user._id !== props.user._id));
      } catch (err) {}
    };
    getNearbyFriends();
    return () => {};
  }, [sendRequest, authUser.location.coordinates, token, props.user._id]);

  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
  }

  return (
    <div className="sidebar">
      <div className="sidebar__wrapper">
        <ul className="sidebar__list">
          <li className="sidebar__listitem">
            <RssFeedOutlined className="sidebar__icon" />
            <Link style={{ textDecoration: 'none' }} to={`/feed`}>
              <span className="sidebar__listitem--text">Feed</span>
            </Link>
          </li>
          <li className="sidebar__listitem">
            <ChatBubbleOutlineOutlined className="sidebar__icon" />
            <Link style={{ textDecoration: 'none' }} to={`/messenger`}>
              <span className="sidebar__listitem--text">Chats</span>
            </Link>
          </li>
          <li className="sidebar__listitem">
            <PhotoCameraOutlined className="sidebar__icon" />
            <Link
              style={{ textDecoration: 'none', outline: 'none' }}
              to={`photos`}
            >
              <span className="sidebar__listitem--text">Photos</span>
            </Link>
          </li>
          <li className="sidebar__listitem">
            <PlayCircleOutlineOutlined className="sidebar__icon" />
            <span className="sidebar__listitem--text">Videos</span>
          </li>
          <li className="sidebar__listitem">
            <Group className="sidebar__icon" />
            <span className="sidebar__listitem--text">Groups</span>
          </li>
          <li className="sidebar__listitem">
            <Bookmarks className="sidebar__icon" />
            <span className="sidebar__listitem--text">Bookmarks</span>
          </li>
          <li className="sidebar__listitem">
            <Help className="sidebar__icon" />
            <span className="sidebar__listitem--text">Questions</span>
          </li>
          <li className="sidebar__listitem">
            <Event className="sidebar__icon" />
            <span className="sidebar__listitem--text">Jobs</span>
          </li>
          <li className="sidebar__listitem">
            <School className="sidebar__icon" />
            <span className="sidebar__listitem--text">Events</span>
          </li>
          <li className="sidebar__listitem">
            <Settings className="sidebar__icon" />
            <span className="sidebar__listitem--text">Courses</span>
          </li>
        </ul>
        <button className="sidebarButton">Show More</button>
        <hr className="sidebarHr" />
        <h4>People You May Know</h4>
        <ul className="sidebarFriendList">
          {loading && <LoadingSpinner asOverlay />}
          {nearbyFriends?.map(friend => (
            <UsersNearby key={friend._id} user={friend} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeftBar;
