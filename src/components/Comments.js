import React from 'react';
import { format } from 'timeago.js';
import Reactions from './Reactions';
import './Comments.css';

export default function Comments({ comment }) {
  return (
    <React.Fragment>
      <li className="comment">
        <div className="message">
          <h5>
            {comment.user.firstName} {comment.user.lastName}
          </h5>
          <div className="commentTop">
            <img
              className="commentImg"
              src={`${comment.user.profilePic}`}
              alt=""
            />
            <p className="commentText">{comment.comment}</p>
          </div>
          <div className="commentBottom">
            <Reactions comment={comment} />
            <div className="commentBottomRight">
              <span>{format(comment.createdAt)}</span>
            </div>
          </div>
        </div>
      </li>
    </React.Fragment>
  );
}