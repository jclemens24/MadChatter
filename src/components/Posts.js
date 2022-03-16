import React, { useEffect, useState, useRef } from 'react';
import { MoreVert, ThumbUp, ThumbDown } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'timeago.js';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import Comments from './Comments';
import { userToken, authorizedUser } from '../slices/authSlice';
import {
  postActions,
  deleteAPost,
  postError,
  postErrorMessage,
  postStatus,
  selectPostComments,
  selectPostId,
} from '../slices/postSlice';
import InputEmojiWithRef from 'react-input-emoji';
import { likeAPost, dislikeAPost, commentOnAPost } from '../slices/postThunks';
import {
  selectFriendPostComments,
  selectFriendPostId,
  commentOnAFriendsPost,
  likeAFriendsPost,
  dislikeAFriendsPost,
} from '../slices/friendSlice';
import './Posts.css';

const Post = props => {
  const [numOfLikes, setNumOfLikes] = useState(props.post?.likes.length);
  const [isLiked, setIsLiked] = useState();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCommentDropdown, setShowCommentDropdown] = useState(false);
  const [text, setText] = useState('');
  const token = useSelector(userToken);
  const authUser = useSelector(authorizedUser);
  const location = useLocation();
  const postId = useSelector(state => selectPostId(state, props.post._id));
  const postComments = useSelector(state => selectPostComments(state, postId));
  const friendPostId = useSelector(state =>
    selectFriendPostId(state, props.post._id)
  );
  const friendPostComments = useSelector(state =>
    selectFriendPostComments(state, friendPostId)
  );
  const error = useSelector(postError);
  const errorMessage = useSelector(postErrorMessage);
  const status = useSelector(postStatus);
  const dispatch = useDispatch();
  const postComment = useRef();

  useEffect(() => {
    if (props.post.likes.some(p => p._id === authUser._id)) setIsLiked(true);
  }, [authUser._id, props.post.likes]);

  const clearError = () => {
    dispatch(postActions.acknowledgeError());
  };

  const likeHandler = async () => {
    await dispatch(likeAPost({ token, postId: postId }))
      .unwrap()
      .then(data => {
        console.log(data);
        setIsLiked(true);
        setNumOfLikes(data.post.likes.length);
      });
  };

  const friendLikeHandler = async () => {
    await dispatch(likeAFriendsPost({ token, postId: friendPostId }))
      .unwrap()
      .then(data => {
        setIsLiked(true);
        setNumOfLikes(data.post.likes.length ?? 0);
      });
  };

  const dislikeHandler = async () => {
    await dispatch(dislikeAPost({ token, postId: postId }))
      .unwrap()
      .then(data => {
        console.log(data);
        setIsLiked(false);
        setNumOfLikes(data.post.likes.length);
      });
  };

  const friendDislikeHandler = async () => {
    await dispatch(dislikeAFriendsPost({ token, postId: friendPostId }))
      .unwrap()
      .then(data => {
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
    dispatch(deleteAPost(postId));
  };

  const handleOnEnter = async text => {
    setText(text);
    dispatch(commentOnAPost({ token, postId: postId, comment: text }));
  };

  const handleFriendOnEnter = async text => {
    setText(text);
    dispatch(
      commentOnAFriendsPost({ token, postId: friendPostId, comment: text })
    );
  };

  if (status === 'pending') {
    return <LoadingSpinner asOverlay />;
  }

  if (error) {
    return <ErrorModal error={errorMessage} onClear={clearError} />;
  }

  if ((location.state = 'friendProfile')) {
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
              <span className="postDate">{format(props.post.createdAt)}</span>
            </div>
            <div className="postTopRight dropdown">
              <MoreVert
                onClick={handleVertOptions}
                style={{ cursor: 'pointer' }}
                focusable="true"
              />
              {authUser._id === props.user._id && showDropdown && (
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
            {props.post.image && (
              <img
                className="postImg"
                src={`http://localhost:8000/${props.post.image}`}
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
              <span className="postLikeCounter">
                {numOfLikes} people like it
              </span>
            </div>
            <div className="postBottomRight">
              <span onClick={handleCommentClick} className="postCommentText">
                {props.post.comments.length} comments
              </span>
            </div>
          </div>
        </div>
        {showCommentDropdown && (
          <div style={{ display: 'block' }} className="dropdown-comment">
            <ul className="comments">
              {
                (location.state =
                  'friendProfile' &&
                  friendPostComments.map(comment => (
                    <Comments comment={comment} key={comment.id} />
                  )))
              }
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
            <span className="postDate">{format(props.post.createdAt)}</span>
          </div>
          <div className="postTopRight dropdown">
            <MoreVert
              onClick={handleVertOptions}
              style={{ cursor: 'pointer' }}
              focusable="true"
            />
            {authUser._id === props.user._id && showDropdown && (
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
          {props.post.image && (
            <img
              className="postImg"
              src={`http://localhost:8000/${props.post.image}`}
              alt=""
            />
          )}
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
              {props.post.comments.length} comments
            </span>
          </div>
        </div>
      </div>
      {showCommentDropdown && (
        <div style={{ display: 'block' }} className="dropdown-comment">
          <ul className="comments">
            {postComments.length === 0 ? (
              <span>Be the first to comment</span>
            ) : (
              postComments.map(comment => (
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
                onEnter={handleOnEnter}
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

export default Post;
