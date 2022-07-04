import React from 'react';
import './Online.css';

const Online = props => {
  return (
    <li className="rightbarFriend">
      <div className="rightbarProfileImgContainer">
        <img
          className="rightbarProfileImg"
          src={`${process.env.REACT_APP_ASSETS}/${props.user.profilePic}`}
          alt=""
        />
        <span className="rightbarOnline"></span>
      </div>
      <span className="rightbarUsername">{props.user.firstName}</span>
    </li>
  );
};

export default Online;