import React from 'react';
import Post from './Posts';
import Share from './Share';
import './UserFeed.css';
import { useSelector } from 'react-redux';

const UserFeed = props => {
  const authUser = useSelector(state => state.auth.user);
  return (
    <div className="feed">
      <div className="feed__wrapper">
        {props.user._id === authUser._id && props.user.firstName && (
          <Share user={props.user} />
        )}
        {props.posts?.map(p => (
          <Post key={p._id} post={p} user={props.user} />
        ))}
      </div>
    </div>
  );
};

export default UserFeed;
