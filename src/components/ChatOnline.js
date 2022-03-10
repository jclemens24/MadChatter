import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { userToken } from '../slices/authSlice';
import axios from 'axios';
import './ChatOnline.css';

export default function ChatOnline(props) {
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const token = useSelector(userToken);

  useEffect(() => {
    setFriends(props.user.following);
    setOnlineFriends(
      friends.filter(friend => props.onlineUsers.includes(friend._id))
    );
  }, [friends, props.onlineUsers, props.user.following]);

  const handleClick = async friend => {
    try {
      const res = await axios({
        method: 'GET',
        url: `http://localhost:8000/api/conversations/${friend._id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.data;
      props.setCurrentChat(data.conversations);
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

  return (
    <div className="chatOnline">
      {onlineFriends.map(friend => (
        <div className="chatOnlineFriend" onClick={() => handleClick(friend)}>
          <div className="chatOnlineImgContainer">
            <img className="chatOnlineImg" src={friend?.profilePic} alt="" />
            <div className="chatOnlineBadge"></div>
          </div>
          <span className="chatOnlineName">{friend?.firstName}</span>
        </div>
      ))}
    </div>
  );
}
