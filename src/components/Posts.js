import React, { useEffect, useState, useRef } from 'react';
import { MoreVert, ThumbUp, ThumbDown } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'timeago.js';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { userToken, authorizedUser } from '../slices/authSlice';
import {
  selectPostById,
  postActions,
  deleteAPost,
  postError,
  postErrorMessage,
  postStatus,
} from '../slices/postSlice';
import { likeAPost, dislikeAPost } from '../slices/postThunks';
import './Posts.css';

export default function Post(props) {
  const [numOfLikes, setNumOfLikes] = useState(props.post?.likes.length);
  const [isLiked, setIsLiked] = useState();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCommentDropdown, setShowCommentDropdown] = useState(false);
  const token = useSelector(userToken);
  const authUser = useSelector(authorizedUser);
  const PostById = useSelector(state => selectPostById(state, props.post._id));
  const error = useSelector(postError);
  const errorMessage = useSelector(postErrorMessage);
  const status = useSelector(postStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.post.likes.some(p => p._id === authUser._id)) setIsLiked(true);
  }, [authUser._id, props.post.likes]);

  const clearError = () => {
    dispatch(postActions.acknowledgeError());
  };

  const likeHandler = async () => {
    await dispatch(likeAPost({ token, postId: PostById._id }))
      .unwrap()
      .then(data => {
        console.log(data);
        setIsLiked(true);
        setNumOfLikes(data.post.likes.length);
      });
  };

  const dislikeHandler = async () => {
    await dispatch(dislikeAPost({ token, postId: PostById._id }))
      .unwrap()
      .then(data => {
        console.log(data);
        setIsLiked(false);
        setNumOfLikes(data.post.likes.length);
      });
  };

  const handleVertOptions = () => {
    setShowDropdown(prevState => {
      return !prevState;
    });
  };

  const handleCommentClick = () => {
    setShowCommentDropdown(prevState => {
      return !prevState;
    });
  };

  const handleDeletePost = async () => {
    dispatch(deleteAPost(PostById._id));
  };

  if (status === 'pending') {
    return <LoadingSpinner asOverlay />;
  }

  if (error) {
    return <ErrorModal error={errorMessage} onClear={clearError} />;
  }

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link
              to={
                props.user._id === authUser._id
                  ? `/${props.user._id}/profile`
                  : `/${props.user._id}/profile/friend`
              }
            >
              <img
                className="postProfileImg"
                src={`http://localhost:8000/${props.user.profilePic}`}
                alt=""
              />
            </Link>
            <span className="postUsername">{`${props.user.firstName} ${props.user.lastName}`}</span>
            <span className="postDate">{format(props.post.createdAt)}</span>
          </div>
          <div className="postTopRight dropdown">
            <MoreVert
              onClick={handleVertOptions}
              style={{ cursor: 'pointer' }}
              focusable="true"
            />
            {showDropdown && (
              <div style={{ display: 'block' }} className="dropdown-content">
                <span onClick={handleDeletePost} className="dropdown-option">
                  Delete
                </span>
              </div>
            )}
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
            <span onClick={handleCommentClick} className="postCommentText">
              {props.post.comment} comments
            </span>
          </div>
        </div>
      </div>
      {showCommentDropdown && (
        <div
          style={{ display: 'flex', justifyContent: 'center' }}
          className="dropdown-comment"
        >
          <span>Comments go here</span>
        </div>
      )}
    </div>
  );
}
