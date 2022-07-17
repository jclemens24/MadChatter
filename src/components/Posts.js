import React, { useEffect, useState, useRef } from 'react';
import { MoreVert, ThumbUp, ThumbDown } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'timeago.js';
import ErrorModal from '../UI/ErrorModal';
import Comments from './Comments';
import { userToken, authorizedUser } from '../slices/authSlice';
import {
  postActions,
  deleteAPost,
  postError,
  postErrorMessage,
  selectPostId,
} from '../slices/postSlice';
import InputEmojiWithRef from 'react-input-emoji';
import { likeAPost, dislikeAPost, commentOnAPost } from '../slices/postThunks';
import './Posts.css';

const Post = props => {
  const post = useSelector(state =>
    state.post.posts.find(p => p._id === props.postId)
  );
  const [numOfLikes, setNumOfLikes] = useState(post?.likes.length);
  const [isLiked, setIsLiked] = useState();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCommentDropdown, setShowCommentDropdown] = useState(false);
  const [text, setText] = useState('');
  const token = useSelector(userToken);
  const authUser = useSelector(authorizedUser);
  const postId = useSelector(state => selectPostId(state, props.postId));
  const error = useSelector(postError);
  const errorMessage = useSelector(postErrorMessage);
  const dispatch = useDispatch();
  const postComment = useRef();

  useEffect(() => {
    if (post.likes.some(p => p === authUser._id)) setIsLiked(true);
  }, [authUser._id, post.likes]);

  const clearError = () => {
    dispatch(postActions.acknowledgeError());
  };

  const likeHandler = async () => {
    await dispatch(likeAPost({ token, postId: postId }))
      .unwrap()
      .then(data => {
        setIsLiked(true);
        setNumOfLikes(data.post.likes.length);
      });
  };

  const dislikeHandler = async () => {
    await dispatch(dislikeAPost({ token, postId: postId }))
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
    dispatch(deleteAPost(postId));
  };

  const handleOnEnter = async text => {
    setText(text);
    dispatch(
      commentOnAPost({
        token,
        postId,
        comment: text,
      })
    )
      .unwrap()
      .then(() => {
        setText('');
      });
  };

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
              {post.fromUser.profilePic && (
                <img
                  className="postProfileImg"
                  src={`${post.fromUser.profilePic}`}
                  alt={`${post.fromUser.firstName}`}
                />
              )}
            </Link>
            <span className="postUsername">{`${post.fromUser.firstName} ${post.fromUser.lastName}`}</span>
            <span className="postDate">{format(post.createdAt)}</span>
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
          <span className="postText">{post?.desc}</span>
          {post.image && (
            <img className="postImg" src={`${post.image}`} alt="" />
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
              {`${post.comments.length} comments`}
            </span>
          </div>
        </div>
      </div>
      {showCommentDropdown && (
        <div style={{ display: 'block' }} className="dropdown-comment">
          <ul className="comments">
            {post.comments && post.comments.length ? (
              post.comments.map(comment => (
                <Comments comment={comment} key={comment.id} />
              ))
            ) : (
              <span>Be the first to comment</span>
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
};

export default Post;
