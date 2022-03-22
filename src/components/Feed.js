import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authorizedUser, userToken } from '../slices/authSlice';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js';
import { MoreVert, ThumbUp, ThumbDown } from '@mui/icons-material';
import Comments from './Comments';
import { deleteAPost } from '../slices/postSlice';
import InputEmojiWithRef from 'react-input-emoji';
import { likeAPost, dislikeAPost, commentOnAPost } from '../slices/postThunks';
import './Posts.css';

export default function Feed(props) {
  const authUser = useSelector(authorizedUser);
  const token = useSelector(userToken);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCommentDropdown, setShowCommentDropdown] = useState(false);
  const [numOfLikes, setNumOfLikes] = useState(props.post?.likes.length);
  const [isLiked, setIsLiked] = useState();
  const [text, setText] = useState('');
  const dispatch = useDispatch();
  const postComment = useRef();

  useEffect(() => {
    if (props.post.likes.some(p => p === authUser._id)) setIsLiked(true);
  }, [authUser._id, props.post.likes]);

  const likeHandler = async () => {
    await dispatch(likeAPost({ token, postId: props.post._id }))
      .unwrap()
      .then(data => {
        setIsLiked(true);
        setNumOfLikes(data.post.likes.length);
      });
  };

  const dislikeHandler = async () => {
    await dispatch(dislikeAPost({ token, postId: props.post._id }))
      .unwrap()
      .then(data => {
        setIsLiked(false);
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
    dispatch(deleteAPost(props.post._id));
  };

  const handleOnEnter = async text => {
    setText(text);
    dispatch(
      commentOnAPost({
        token,
        postId: props.post._id,
        comment: text,
      })
    );
  };

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
              {props.post.fromUser.profilePic && (
                <img
                  className="postProfileImg"
                  src={`${process.env.REACT_APP_ASSETS}/${props.post.fromUser.profilePic}`}
                  alt={`${props.post.fromUser.firstName}`}
                />
              )}
            </Link>
            <span className="postUsername">{`${props.post.fromUser.firstName} ${props.post.fromUser.lastName}`}</span>
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
              src={`${process.env.REACT_APP_ASSETS}/${props.post.image}`}
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
              {`${props.post.comments?.length} comments`}
            </span>
          </div>
        </div>
      </div>
      {showCommentDropdown && (
        <div style={{ display: 'block' }} className="dropdown-comment">
          <ul className="comments">
            {props.post.comments?.length === 0 ? (
              <span>Be the first to comment</span>
            ) : (
              props.post.comments?.map(comment => (
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
