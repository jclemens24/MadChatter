import React, { useEffect, useState } from 'react';
import { MoreVert, ThumbUp, ThumbDown } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'timeago.js';
import { useHttp } from '../hooks/useHttp';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import './Posts.css';

export default function Post(props) {
  const [numOfLikes, setNumOfLikes] = useState(props.post?.likes.length);
  const [isLiked, setIsLiked] = useState();
  const token = useSelector(state => state.auth.token);
  const authUser = useSelector(state => state.auth.user);
  const { loading, error, sendRequest, clearError } = useHttp();
  const picture = props.user.profilePic.startsWith('http')
    ? `${props.user.profilePic}`
    : `http://localhost:8000/${props.user.profilePic}`;

  useEffect(() => {
    if (props.post.likes.some(p => p._id === authUser._id)) setIsLiked(true);
  }, [authUser._id, props.post.likes]);

  const likeHandler = async () => {
    try {
      const res = await sendRequest(
        `http://localhost:8000/api/posts/${props.post._id}/like`,
        'PUT',
        { Authorization: `Bearer ${token}` }
      );
      setIsLiked(true);
      setNumOfLikes(res.post.likes.length);
    } catch (err) {}
  };

  const dislikeHandler = async () => {
    try {
      const res = await sendRequest(
        `http://localhost:8000/api/posts/${props.post._id}/dislike`,
        'PUT',
        { Authorization: `Bearer ${token}` }
      );
      setIsLiked(false);
      setNumOfLikes(res.post?.likes.length);
    } catch (err) {}
  };

  if (loading) {
    return <LoadingSpinner asOverlay />;
  }

  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
  }

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/${props.user._id}/profile`}>
              <img className="postProfileImg" src={picture} alt="" />
            </Link>
            <span className="postUsername">{`${props.user.firstName} ${props.user.lastName}`}</span>
            <span className="postDate">{format(props.post.createdAt)}</span>
          </div>
          <div className="postTopRight">
            <MoreVert />
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{props.post?.desc}</span>
          <img
            className="postImg"
            src={`http://localhost:8000/${props.post.image}`}
            alt=""
          />
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <ThumbUp
              className={isLiked ? `likeIcon liked` : 'likeIcon'}
              onClick={likeHandler}
            />
            <ThumbDown
              className={!isLiked ? 'likeIcon liked' : 'likeIcon'}
              onClick={dislikeHandler}
            />
            <span className="postLikeCounter">{numOfLikes} people like it</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText">
              {props.post.comment} comments
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
