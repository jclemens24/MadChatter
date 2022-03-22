import React from 'react';
import './Conversation.css';

export default function Conversation(props) {
  return (
    <>
      {props.conversation.members.map(
        mem =>
          mem._id !== props.user._id && (
            <div key={mem._id} className="conversation">
              <img
                className="conversationImg"
                src={`${process.env.REACT_APP_ASSETS}/${mem.profilePic}`}
                alt={`${mem.firstName} `}
              />
              <span className="conversationName">{mem.firstName}</span>
            </div>
          )
      )}
    </>
  );
}
