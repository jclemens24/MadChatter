import React from 'react';
import FriendPosts from './FriendPosts';
import Share from './Share';
import './UserFeed.css';
import { useSelector } from 'react-redux';

const FriendUserFeed = props => {
  const posts = useSelector(state => state.friend.friendPosts);

  return (
    <div className="feed">
      <div className="feed__wrapper">
        <Share user={props.user} />
        {posts.map(p => (
          <FriendPosts key={p._id} user={props.user} postId={p._id} />
        ))}
      </div>
    </div>
  );
};

export default FriendUserFeed;
