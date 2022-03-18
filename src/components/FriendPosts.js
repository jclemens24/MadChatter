import React, { useEffect, useState, useRef } from 'react';
import { MoreVert, ThumbUp, ThumbDown } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'timeago.js';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import Comments from './Comments';
import { userToken, authorizedUser } from '../slices/authSlice';
import InputEmojiWithRef from 'react-input-emoji';
import { deleteAPost } from '../slices/postSlice';
import {
  commentOnAFriendsPost,
  likeAFriendsPost,
  dislikeAFriendsPost,
  selectFriendPostId,
  friendErrorMessage,
  friendStatus,
  selectCurrentFriendPost,
} from '../slices/friendSlice';
import { useHttp } from '../hooks/useHttp';
import './Posts.css';

const FriendPosts = props => {
  const token = useSelector(userToken);
  const authUser = useSelector(authorizedUser);
  const postId = useSelector(state => selectFriendPostId(state, props.postId));
  const post = useSelector(state => selectCurrentFriendPost(state, postId));
  const [numOfLikes, setNumOfLikes] = useState(post?.likes.length);
  const [isLiked, setIsLiked] = useState();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCommentDropdown, setShowCommentDropdown] = useState(false);
  const [text, setText] = useState('');
  const { loading, error, sendRequest, clearError } = useHttp();
  const errorMessage = useSelector(friendErrorMessage);
  const status = useSelector(friendStatus);
  const dispatch = useDispatch();
  const postComment = useRef();

  useEffect(() => {
    if (post.likes?.some(p => p === authUser._id)) setIsLiked(true);
  }, [authUser._id, post.likes]);

  const friendLikeHandler = async () => {
    await dispatch(likeAFriendsPost({ token, postId }))
      .unwrap()
      .then(data => {
        setNumOfLikes(data.post.likes.length);
      });
  };

  const friendDislikeHandler = async () => {
    await dispatch(dislikeAFriendsPost({ token, postId }))
      .unwrap()
      .then(data => {
        setNumOfLikes(data.post.likes.length ?? 0);
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
    dispatch(deleteAPost(props.postId));
  };

  const handleFriendOnEnter = async text => {
    setText(text);
    dispatch(commentOnAFriendsPost({ token, postId, comment: text }));
  };

  // if (status === 'idle' || status === 'pending') {
  //   return <LoadingSpinner asOverlay />;
  // }

  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
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
              {props.user.profilePic && (
                <img
                  className="postProfileImg"
                  src={`http://localhost:8000/${props.user.profilePic}`}
                  alt=""
                />
              )}
            </Link>
            <span className="postUsername">{`${props.user.firstName} ${props.user.lastName}`}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postTopRight dropdown">
            <MoreVert
              onClick={handleVertOptions}
              style={{ cursor: 'pointer' }}
              focusable="true"
            />
            {authUser._id === post.userId._id && showDropdown && (
              <div style={{ display: 'block' }} className="dropdown-content">
                <span onClick={handleDeletePost} className="dropdown-option">
                  Delete
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post.desc}</span>
          {post.image && (
            <img
              className="postImg"
              src={`http://localhost:8000/${post.image}`}
              alt=""
            />
          )}
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <ThumbUp
              className={isLiked ? `likeIcon liked` : 'likeIcon'}
              onClick={friendLikeHandler}
            />
            <ThumbDown
              className={!isLiked ? 'likeIcon liked' : 'likeIcon'}
              onClick={friendDislikeHandler}
            />
            <span className="postLikeCounter">{numOfLikes} people like it</span>
          </div>
          <div className="postBottomRight">
            <span onClick={handleCommentClick} className="postCommentText">
              comments
            </span>
          </div>
        </div>
      </div>
      {showCommentDropdown && (
        <div style={{ display: 'block' }} className="dropdown-comment">
          <ul className="comments">
            {post.comments?.length === 0 ? (
              <span>Be the first to comment</span>
            ) : (
              post.comments?.map(comment => (
                <Comments comment={comment} key={comment.id} />
              ))
            )}
          </ul>
          <div className="commentActions">
            <form className="leaveAComment">
              <InputEmojiWithRef
                placeholder={'Leave a comment...'}
                className="shareInput"
                ref={postComment}
                onEnter={handleFriendOnEnter}
                onChange={setText}
                cleanOnEnter="true"
                value={text}
                fontFamily={'Open Sans'}
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendPosts;
