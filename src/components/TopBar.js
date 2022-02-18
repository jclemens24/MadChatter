import React from 'react';
import './TopBar.css';
import { PersonOutlineOutlined } from '@mui/icons-material';
import {
  SearchOutlined,
  NotificationsActiveOutlined,
  ChatOutlined,
} from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const TopBar = props => {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const userId = useSelector(state => state.auth.user?._id);
  return (
    <div className="topbar__container">
      <div className="topbar__left">
        <NavLink to={'/'} style={{ textDecoration: 'none' }}>
          <span className="logo">Mad Chatter</span>
        </NavLink>
      </div>
      {isLoggedIn && (
        <div className="topbar__center">
          <div className="search">
            <SearchOutlined className="search__icon"></SearchOutlined>
            <input
              placeholder="Search for friends, posts, or videos"
              className="search__input"
            />
          </div>
        </div>
      )}
      {isLoggedIn && (
        <div className="topbar__right">
          <div className="topbar__links">
            <NavLink className="topbar__link" to={`${userId}/profile`}>
              <span className="topbar__link">Home</span>
            </NavLink>
            <span className="topbar__link">Timeline</span>
          </div>
          <div className="topbar__icons">
            <div className="topbar__icon--item">
              <PersonOutlineOutlined />
            </div>
            <div className="topbar__icon--item">
              <ChatOutlined />
              <span className="topbar__icon--badge">2</span>
            </div>
            <div className="topbar__icon--item">
              <NotificationsActiveOutlined />
              <span className="topbar__icon--badge">1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
