import React from 'react';
import Post from './Posts';
import Share from './Share';
import './UserFeed.css';
import { useSelector } from 'react-redux';
import { authorizedUser } from '../slices/authSlice';

const UserFeed = props => {
  const authUser = useSelector(authorizedUser);
  const posts = useSelector(state => state.post.posts);

  return (
    <div className="feed">
      <div className="feed__wrapper">
        {props.user._id === authUser._id && props.user.firstName && (
          <Share user={props.user} />
        )}
        {posts?.map(p => (
          <Post key={p._id} user={props.user} postId={p._id} />
        ))}
      </div>
    </div>
  );
};

export default UserFeed;
